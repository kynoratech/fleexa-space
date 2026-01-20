"use server";

import { db } from "@/lib/db";
import { users, clients, workspaces, workspaceMembers } from "@/lib/db.schema";
import { eq } from "drizzle-orm";

/* =========================
   SINCRONIZAR USUARIO A NEON
========================= */

export async function syncUserToNeon(firebaseUid: string, email: string, name?: string) {
  try {
    // Verificar si el usuario ya existe en Neon
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);

    if (existingUser.length > 0) {
      // Usuario ya existe, actualizar nombre si viene
      if (name) {
        await db
          .update(users)
          .set({ name })
          .where(eq(users.firebaseUid, firebaseUid));
      }
      return existingUser[0];
    }

    // Crear nuevo usuario en Neon
    const result = await db.insert(users).values({
      firebaseUid,
      email,
      name: name || null,
      plan: "free",
    }).returning();

    return result[0];
  } catch (error) {
    console.error("Error sincronizando usuario a Neon:", error);
    throw error;
  }
}

/* =========================
   CREAR CLIENTE EN NEON
========================= */

export async function createClientInNeon(
  workspaceId: number,
  nombre: string,
  email?: string,
  phone?: string
) {
  try {
    // Validar que el workspace existe
    const workspaceExists = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspaceExists || workspaceExists.length === 0) {
      throw new Error(`Workspace con ID ${workspaceId} no encontrado.`);
    }

    const result = await db
      .insert(clients)
      .values({
        workspaceId,
        name: nombre,
        email: email || null,
        phone: phone || null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error creando cliente en Neon:", error);
    throw error;
  }
}

/* =========================
   CREAR WORKSPACE EN NEON
========================= */

export async function createWorkspaceInNeon(
  userId: number,
  name: string,
  slug: string
) {
  try {
    // Validar que el usuario existe en Neon
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userExists || userExists.length === 0) {
      throw new Error(`Usuario con ID ${userId} no encontrado en Neon. Por favor intenta cerrar sesión y volver a entrar.`);
    }

    // Validar que el usuario no tenga otro workspace con el mismo nombre
    const existingWorkspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .limit(10); // Obtener todos los workspaces del usuario

    const duplicateName = existingWorkspace.some(ws => ws.name.toLowerCase() === name.toLowerCase());
    
    if (duplicateName) {
      throw new Error(`Ya tienes un espacio de trabajo llamado "${name}". Por favor elige otro nombre.`);
    }

    // Generar slug único por usuario agregando timestamp si es necesario
    let finalSlug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    const slugExists = existingWorkspace.some(ws => ws.slug === finalSlug);
    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    // Crear workspace en Neon
    const workspaceResult = await db
      .insert(workspaces)
      .values({
        userId,
        name,
        slug: finalSlug,
      })
      .returning();

    const workspace = workspaceResult[0];

    // Agregar el usuario como owner del workspace en Neon
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId,
      role: "owner",
    });

    return workspace;
  } catch (error) {
    console.error("Error creando workspace en Neon:", error);
    throw error;
  }
}

/* =========================
   OBTENER USUARIO POR FIREBASE UID
========================= */

export async function getUserByFirebaseUid(firebaseUid: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error obteniendo usuario de Neon:", error);
    throw error;
  }
}

/* =========================
   OBTENER WORKSPACES DEL USUARIO
========================= */

export async function getUserWorkspacesFromNeon(userId: number) {
  try {
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));

    return result;
  } catch (error) {
    console.error("Error obteniendo workspaces del usuario:", error);
    throw error;
  }
}

/* =========================
   OBTENER CLIENTES DEL WORKSPACE
========================= */

export async function getWorkspaceClientsFromNeon(workspaceId: number) {
  try {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.workspaceId, workspaceId));

    return result;
  } catch (error) {
    console.error("Error obteniendo clientes del workspace:", error);
    throw error;
  }
}

