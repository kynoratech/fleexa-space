import admin from "firebase-admin";
import serviceAccount from "../firebase-admin.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});

const db = admin.firestore();

async function migrate() {
  console.log("🚀 Iniciando migración...");

  const usersSnap = await db.collection("users").get();

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    console.log(`\n👤 Usuario: ${uid}`);

    // 1️⃣ Buscar workspaces donde es owner
    const memberSnap = await db
      .collection("workspaceMembers")
      .where("userId", "==", uid)
      .where("role", "==", "owner")
      .get();

    if (memberSnap.empty) {
      console.log("⚠️  No tiene workspace owner, se omite");
      continue;
    }

    const workspaceId = memberSnap.docs[0].data().workspaceId;
    console.log(`🏢 Workspace destino: ${workspaceId}`);

    // === COLECCIONES A MIGRAR ===
    const collections = ["clients", "projects", "finanzas"];

    for (const col of collections) {
      const legacyRef = db.collection("users").doc(uid).collection(col);
      const legacySnap = await legacyRef.get();

      if (legacySnap.empty) {
        console.log(`ℹ️  ${col}: vacío`);
        continue;
      }

      console.log(`📦 Migrando ${col} (${legacySnap.size})`);

      for (const docSnap of legacySnap.docs) {
        const targetRef = db
          .collection("workspaces")
          .doc(workspaceId)
          .collection(col)
          .doc(docSnap.id);

        await targetRef.set({
          ...docSnap.data(),
          migratedFromUser: uid,
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  }

  console.log("\n✅ Migración completada con éxito");
}

migrate().catch(console.error);
