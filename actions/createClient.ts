"use server";

import {
  getUserByFirebaseUid,
  getUserWorkspacesFromNeon,
  getWorkspaceClientsFromNeon,
  createClientInNeon,
  createWorkspaceInNeon,
} from "@/actions/neonOperations";
import { canAddClient, getClientLimitMessage } from "@/lib/plans";

interface CreateClientPayload {
  firebaseUid: string;
  workspace: {
    id: string; // Firebase workspace ID
    name: string;
  };
  nombre: string;
  email?: string;
  phone?: string;
}

export async function createClientServer({
  firebaseUid,
  workspace,
  nombre,
  email,
  phone,
}: CreateClientPayload) {
  /* ===============================
     1️⃣ Usuario Neon
  =============================== */
  const neonUser = await getUserByFirebaseUid(firebaseUid);
  if (!neonUser) {
    throw new Error("USER_NOT_IN_NEON");
  }

  /* ===============================
     2️⃣ Obtener workspaceId de Neon
  =============================== */
  let neonWorkspaceId: number | null = null;

  const memberships = await getUserWorkspacesFromNeon(neonUser.id);

  if (memberships && memberships.length > 0) {
    neonWorkspaceId = memberships[0].workspaceId;
  } else {
    // 🔥 Existe en Firebase pero no en Neon → lo creamos
    const slug = workspace.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const newWorkspace = await createWorkspaceInNeon(
      neonUser.id,
      workspace.name,
      slug
    );

    neonWorkspaceId = newWorkspace.id;
  }

  if (!Number.isInteger(neonWorkspaceId)) {
    throw new Error("INVALID_NEON_WORKSPACE_ID");
  }

  /* ===============================
     3️⃣ Plan y límites
  =============================== */
  const currentClients = await getWorkspaceClientsFromNeon(neonWorkspaceId);

  if (!canAddClient(neonUser.plan, currentClients.length)) {
    throw new Error(getClientLimitMessage(neonUser.plan));
  }

  /* ===============================
     4️⃣ Crear cliente en Neon
  =============================== */
  const newClient = await createClientInNeon(
    neonWorkspaceId,
    nombre,
    email,
    phone
  );

  return newClient;
}
