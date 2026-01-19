"use client";

import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export function useGoogleSignIn() {
  const router = useRouter();

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // -----------------------------------------------------------------
      // 🔐 1. Seguridad: Evitar cuentas Google sin email (sí pasa a veces)
      // -----------------------------------------------------------------
      if (!user.email) {
        console.error("❌ Google no entregó email. Cancelado por seguridad.");
        return;
      }

      const googleEmail = user.email.toLowerCase();

      // -----------------------------------------------------------------
      // 🛡 2. Usuario nuevo → se registra
      // -----------------------------------------------------------------
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: googleEmail,
          avatar: user.photoURL || "",
          provider: "google",
          createdAt: new Date(),
        });
      } else {
        // -----------------------------------------------------------------
        // 🚨 3. Usuario existente → Validación anti-hijacking
        // -----------------------------------------------------------------
        const existing = userSnap.data();

        if (existing.email !== googleEmail) {
          console.error("⚠️ Intento sospechoso: email distinto al original.");
          return;
        }
      }

      // -----------------------------------------------------------------
      // 🚀 Login seguro → llevar al dashboard
      // -----------------------------------------------------------------
      router.push("/dashboard");

    } catch (error) {
      console.error("Google Sign-in Error:", error);
    }
  };

  return { signInWithGoogle };
}
