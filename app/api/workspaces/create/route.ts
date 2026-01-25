// app/api/workspaces/create/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  syncUserToNeon,
  createWorkspaceInNeon,
} from "@/actions/neonOperations";
import { canCreateWorkspace, getWorkspaceLimitMessage } from "@/lib/plans";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    // 🔐 Protección request inválido
    if (!req.body) {
      return NextResponse.json(
        { ok: false, error: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const { idToken, name, color } = await req.json();

    if (!idToken || !name) {
      return NextResponse.json(
        { ok: false, error: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    // 1️⃣ Verificar sesión Firebase
    const decoded = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decoded.uid;

    // 2️⃣ Sincronizar / obtener usuario en Neon
const neonUser = await syncUserToNeon(
  firebaseUid,
  decoded.email ?? "",
  decoded.name ?? undefined
);

// 👇 DEBUG CLAVE
console.log("🧠 NEON PLAN RAW:", neonUser.plan);

// 👇 NORMALIZACIÓN ROBUSTA
const rawPlan = String(neonUser.plan ?? "").toLowerCase();

const plan: "free" | "pro" =
  rawPlan.includes("pro") ||
  rawPlan.includes("paid") ||
  rawPlan.includes("premium") ||
  rawPlan.includes("active")
    ? "pro"
    : "free";


    // 4️⃣ Contar SOLO workspaces donde es owner
    const ownerSnap = await adminDb
      .collection("workspaceMembers")
      .where("userId", "==", firebaseUid)
      .where("role", "==", "owner")
      .get();

    const currentCount = ownerSnap.size;

    if (!canCreateWorkspace(plan, currentCount)) {
      return NextResponse.json(
        {
          ok: false,
          error: "LIMIT",
          message: getWorkspaceLimitMessage(plan),
        },
        { status: 403 }
      );
    }

    // 5️⃣ Crear workspace en Neon
    const workspace = await createWorkspaceInNeon(
      neonUser.id,
      name,
      name
    );

    const now = new Date();

    // 6️⃣ Crear workspace en Firestore
    await adminDb
      .collection("workspaces")
      .doc(String(workspace.id))
      .set({
        workspaceId: String(workspace.id),
        name,
        color: color || "blue",
        ownerId: firebaseUid,
        plan: plan,
        createdAt: now,
      });

    // 7️⃣ Crear miembro owner
    await adminDb
      .collection("workspaceMembers")
      .doc(`${workspace.id}_${firebaseUid}`)
      .set({
        workspaceId: String(workspace.id),
        userId: firebaseUid,
        role: "owner",
        joinedAt: now,
      });

    return NextResponse.json({
      ok: true,
      workspaceId: workspace.id,
    });
  } catch (err) {
    console.error("CREATE WORKSPACE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
