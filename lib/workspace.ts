// lib/workspace.ts
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* =========================
   TIPOS
========================= */

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface InviteMemberParams {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
}

export interface AcceptInviteParams {
  inviteId: string;
  workspaceId: string;
  role: WorkspaceRole;
  uid: string;
  invitedBy: string;
}

/* =========================
   CREAR WORKSPACE
========================= */

export async function createWorkspace(
  name: string,
  uid: string
): Promise<string> {
  const wsRef = await addDoc(collection(db, "workspaces"), {
    name,
    ownerId: uid,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "workspaceMembers", `${wsRef.id}_${uid}`), {
    workspaceId: wsRef.id,
    userId: uid,
    role: "owner",
    invitedBy: uid,
    joinedAt: serverTimestamp(),
  });

  return wsRef.id;
}

/* =========================
   INVITAR MIEMBRO
========================= */

export async function inviteMember(params: InviteMemberParams) {
  const email = params.email.trim().toLowerCase();

  await addDoc(collection(db, "invitations"), {
    workspaceId: params.workspaceId,
    email,
    role: params.role,
    status: "pending",
    invitedBy: params.invitedBy,
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, "auditLogs"), {
    workspaceId: params.workspaceId,
    action: "INVITE_CREATED",
    actorId: params.invitedBy,
    meta: {
      email,
      role: params.role,
    },
    createdAt: serverTimestamp(),
  });
}

/* =========================
   OBTENER INVITACIONES
========================= */

export async function getPendingInvitesByEmail(email: string) {
  const q = query(
    collection(db, "invitations"),
    where("email", "==", email.toLowerCase()),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/* =========================
   ACEPTAR INVITACIÓN
========================= */

export async function acceptInvite(params: AcceptInviteParams) {
  await setDoc(
    doc(db, "workspaceMembers", `${params.workspaceId}_${params.uid}`),
    {
      workspaceId: params.workspaceId,
      userId: params.uid,
      role: params.role,
      invitedBy: params.invitedBy,
      joinedAt: serverTimestamp(),
    }
  );

  await updateDoc(doc(db, "invitations", params.inviteId), {
    status: "accepted",
    acceptedBy: params.uid,
    acceptedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "auditLogs"), {
    workspaceId: params.workspaceId,
    action: "INVITE_ACCEPTED",
    actorId: params.uid,
    meta: {
      inviteId: params.inviteId,
    },
    createdAt: serverTimestamp(),
  });
}
