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
  arrayUnion,
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
  workspaceName?: string;
  workspaceColor?: string;
}

export interface AcceptInviteParams {
  inviteId: string;
  workspaceId: string;
  role: WorkspaceRole;
  uid: string;
  invitedBy?: string;
  invitedEmail?: string;
}

/* =========================
   CREAR WORKSPACE
========================= */

export async function createWorkspace(name: string, uid: string): Promise<string> {
  const wsSnap = await addDoc(collection(db, "workspaces"), {
    name,
    ownerId: uid,
    createdBy: uid,
    createdAt: serverTimestamp(),
    members: [],
  });

  await setDoc(doc(db, "workspaceMembers", `${wsSnap.id}_${uid}`), {
    workspaceId: wsSnap.id,
    userId: uid,
    role: "owner",
    invitedBy: "system",
    joinedAt: serverTimestamp(),
  });

  return wsSnap.id;
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
    invitedEmail: email,
    invitedBy: params.invitedBy ?? "system",
    workspaceName: params.workspaceName ?? null,
    workspaceColor: params.workspaceColor ?? params.workspaceColor ?? "blue",
    invitedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "auditLogs"), {
    workspaceId: params.workspaceId,
    action: "INVITE_CREATED",
    actorId: params.invitedBy,
    meta: { email, role: params.role },
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
    inviteId: d.id,
    ...d.data(),
  }));
}

/* =========================
   ACEPTAR INVITACIÓN
========================= */

export async function acceptInvite(params: AcceptInviteParams) {
  const invitedBySafe = params.invitedBy ?? "system";

  const workspaceRef = doc(db, "workspaces", params.workspaceId);
  await updateDoc(workspaceRef, {
    members: arrayUnion(params.invitedEmail ?? params.uid),
  });

  await setDoc(
    doc(db, "workspaceMembers", `${params.workspaceId}_${params.uid}`),
    {
      workspaceId: params.workspaceId,
      userId: params.uid,
      role: params.role,
      invitedBy: invitedBySafe,
      invitedEmail: params.invitedEmail ?? null,
      joinedAt: serverTimestamp(),
    }
  );

  await updateDoc(doc(db, "workspaceMembers", params.inviteId), {
    status: "accepted",
    acceptedBy: params.uid,
    acceptedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "auditLogs"), {
    workspaceId: params.workspaceId,
    action: "INVITE_ACCEPTED",
    actorId: params.uid,
    meta: { inviteId: params.inviteId },
    createdAt: serverTimestamp(),
  });
}
