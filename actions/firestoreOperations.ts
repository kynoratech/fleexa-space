"use client";

import { db as firebaseDb } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

/* =========================
   SINCRONIZAR USUARIO A FIRESTORE
========================= */

export async function syncUserToFirestore(firebaseUid: string, email: string, name?: string) {
  try {
    await setDoc(doc(firebaseDb, "users", firebaseUid), {
      uid: firebaseUid,
      email,
      name: name || "",
      provider: "email",
      createdAt: new Date(),
    }, { merge: true });

    return { uid: firebaseUid, email };
  } catch (error) {
    console.error("Error sincronizando usuario a Firestore:", error);
    throw error;
  }
}

/* =========================
   CREAR CLIENTE EN FIRESTORE
========================= */

export async function createClientInFirestore(
  firebaseUid: string,
  nombre: string,
  email?: string,
  phone?: string,
  neonId?: number
) {
  try {
    const docRef = await addDoc(
      collection(firebaseDb, "users", firebaseUid, "clients"),
      {
        neonId: neonId || null,
        nombre: nombre.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        createdAt: serverTimestamp(),
        createdByUid: firebaseUid,
      }
    );

    return { id: docRef.id, nombre, email, phone };
  } catch (error) {
    console.error("Error creando cliente en Firestore:", error);
    throw error;
  }
}

/* =========================
   CREAR WORKSPACE EN FIRESTORE
========================= */

export async function createWorkspaceInFirestore(
  firebaseUid: string,
  name: string,
  neonId?: number
) {
  try {
    const workspaceRef = await addDoc(collection(firebaseDb, "workspaces"), {
      neonId: neonId || null,
      name,
      ownerId: firebaseUid,
      createdBy: firebaseUid,
      createdAt: serverTimestamp(),
      members: [firebaseUid],
    });

    // Crear documento de miembro en Firestore
    await setDoc(doc(firebaseDb, "workspaceMembers", `${workspaceRef.id}_${firebaseUid}`), {
      workspaceId: workspaceRef.id,
      userId: firebaseUid,
      role: "owner",
      invitedBy: "system",
      joinedAt: serverTimestamp(),
    });

    return { id: workspaceRef.id, name };
  } catch (error) {
    console.error("Error creando workspace en Firestore:", error);
    throw error;
  }
}
