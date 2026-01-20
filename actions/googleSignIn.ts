"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { syncUserToNeon } from "@/actions/neonOperations";
import { syncUserToFirestore } from "@/actions/firestoreOperations";

export function useGoogleSignIn() {
  const router = useRouter();

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) return;

      // -----------------------------------------------------------------
      // 🔐 1. Seguridad: Evitar cuentas Google sin email (sí pasa a veces)
      // -----------------------------------------------------------------
      if (!user.email) {
        console.error("❌ Google no entregó email. Cancelado por seguridad.");
        return;
      }

      const googleEmail = user.email.toLowerCase();

      // -----------------------------------------------------------------
      // 🚀 2. Sincronizar usuario a Neon y Firestore en paralelo
      // -----------------------------------------------------------------
      await Promise.all([
        syncUserToNeon(user.uid, googleEmail, user.displayName || undefined),
        syncUserToFirestore(user.uid, googleEmail, user.displayName || undefined),
      ]);

      // -----------------------------------------------------------------
      // 🚀 3. Login seguro → llevar al dashboard
      // -----------------------------------------------------------------
      router.push("/dashboard");

    } catch (error) {
      console.error("Google Sign-in Error:", error);
    }
  };

  return { signInWithGoogle };
}
