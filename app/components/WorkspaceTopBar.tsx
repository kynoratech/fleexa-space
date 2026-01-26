"use client";

import { useState, useEffect } from "react";
import { Users, X, Trash2, LogOut as LeaveIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";
import InviteButton from "../components/invitations/InviteButton";
import WorkspaceSwitcher from "./workspaces/WorkspaceSwitcher";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function WorkspaceTopBar() {
  const { workspace, loading } = useActiveWorkspace();
  const [openMembers, setOpenMembers] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // 🔹 Cargar miembros del workspace actual
  useEffect(() => {
    if (!workspace?.workspaceId) {
      setMembers([]);
      return;
    }

    const q = query(
      collection(db, "workspaceMembers"),
      where("workspaceId", "==", workspace.workspaceId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMembers(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [workspace?.workspaceId]);

  if (loading) return null;

  // SIN WORKSPACE → ONBOARDING
  if (!workspace) {
    return (
      <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">
            No tienes un espacio de trabajo activo
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Crea uno para comenzar a organizar clientes y tareas.
          </p>
        </div>
        <a
          href="/onboarding/workspace"
          className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-sm font-medium"
        >
          Crear espacio
        </a>
      </div>
    );
  }

  const isOwner = workspace.role === "owner";
  const isAdmin = workspace.role === "owner" || workspace.role === "admin";
  const isMember = workspace.role !== "owner";
  const isPro = workspace.plan === "pro";
  const canInvite = isAdmin && isPro;
  const memberCount = members.length;

  // 🧨 ELIMINAR WORKSPACE (SOLO OWNER)
  const handleDeleteWorkspace = async () => {
    if (!workspace?.workspaceId) return;

    const confirmed = confirm(
      "⚠️ Esta acción eliminará el workspace completo y no se puede deshacer.\n\n¿Deseas continuar?"
    );
    if (!confirmed) return;

    setProcessing(true);

    try {
      // Eliminar memberships
      const q = query(
        collection(db, "workspaceMembers"),
        where("workspaceId", "==", workspace.workspaceId)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));

      // Eliminar workspace
      await deleteDoc(doc(db, "workspaces", workspace.workspaceId));

      router.push("/onboarding/workspace");
    } catch (err) {
      console.error("DELETE WORKSPACE ERROR", err);
      alert("Error al eliminar el workspace");
    } finally {
      setProcessing(false);
    }
  };

  // 🚪 SALIR DEL WORKSPACE (INVITADO)
  const handleLeaveWorkspace = async () => {
    if (!workspace?.workspaceId || !auth.currentUser) return;

    const confirmed = confirm(
      "¿Deseas salir de este workspace?\n\nPerderás acceso a su contenido."
    );
    if (!confirmed) return;

    setProcessing(true);

    try {
      const memberId = `${workspace.workspaceId}_${auth.currentUser.uid}`;
      await deleteDoc(doc(db, "workspaceMembers", memberId));
      router.push("/dashboard");
    } catch (err) {
      console.error("LEAVE WORKSPACE ERROR", err);
      alert("Error al salir del workspace");
    } finally {
      setProcessing(false);
    }
  };

  // 🧑‍🚀 ELIMINAR COLABORADOR (OWNER / ADMIN)
  const handleRemoveMember = async (member: any) => {
    if (!workspace?.workspaceId) return;

    const confirmed = confirm(
      `¿Eliminar a este colaborador del workspace?\n\nPerderá acceso inmediato.`
    );
    if (!confirmed) return;

    setProcessing(true);

    try {
      const memberRef = doc(db, "workspaceMembers", member.id);
      await deleteDoc(memberRef);
    } catch (err) {
      console.error("REMOVE MEMBER ERROR", err);
      alert("Error al eliminar colaborador");
    } finally {
      setProcessing(false);
    }
  };

const currentUserId = auth.currentUser?.uid;

function canRemoveMember(member: any) {
  // ❌ No eliminarse a sí mismo
  if (member.userId === currentUserId) return false;

  // ✅ Owner puede eliminar a cualquiera
  if (isOwner) return true;

  // ✅ Admin puede eliminar solo a NO owners
  if (isAdmin && member.role !== "owner") return true;

  return false;
}

  return (
    <>
      {/* TOP BAR */}
      <div className="mb-10 border-b border-slate-200 pb-5 flex items-start justify-between">
        {/* LEFT */}
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-3 w-3 rounded-full"
            style={{
              backgroundColor:
                workspace.color === "blue" ? "#2563eb" : workspace.color,
            }}
          />
          <div>
            <WorkspaceSwitcher />
            <p className="text-sm text-slate-500 mt-1">
              Rol:{" "}
              <span className="font-medium text-slate-700 capitalize">
                {workspace.role}
              </span>{" "}
              {workspace.role === "viewer"
                ? "Solo puedes ver el contenido"
                : "Puedes crear y editar contenido"}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenMembers(true)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <Users size={16} />
            Miembros ({memberCount})
          </button>

          {/* INVITAR */}
          {isAdmin && isPro && <InviteButton />}

          {isAdmin && !isPro && (
            <div className="relative group">
              <button
                disabled
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm flex items-center gap-2 opacity-50 cursor-not-allowed"
              >
                Invitar
              </button>
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                Disponible solo en el plan Pro
              </div>
            </div>
          )}

          {/* OWNER → ELIMINAR */}
          {isOwner && (
            <div className="relative group">
              <button
                onClick={handleDeleteWorkspace}
                disabled={processing}
                className="rounded-lg border border-red-200 text-red-600 px-4 py-2 text-sm flex items-center gap-2 hover:bg-red-50 transition disabled:opacity-50"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
              <div className="absolute right-0 mt-2 w-64 rounded-lg bg-slate-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                Elimina completamente este workspace
              </div>
            </div>
          )}

          {/* INVITADO → SALIR */}
          {isMember && (
            <div className="relative group">
              <button
                onClick={handleLeaveWorkspace}
                disabled={processing}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <LeaveIcon size={16} />
                Salir
              </button>
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 text-white text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                Salir de este workspace
              </div>
            </div>
          )}
        </div>
      </div>
      

      {/* MODAL DE MIEMBROS */}
      <AnimatePresence>
        {openMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Users size={18} /> Miembros del workspace
                </h3>
                <button
                  onClick={() => setOpenMembers(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {members.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {m.userProfile?.name?.trim() ||
                          m.userProfile?.email ||
                          m.invitedEmail ||
                          (m.userId === auth.currentUser?.uid
                            ? auth.currentUser?.email
                            : "Usuario")}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {m.role}
                      </p>
                    </div>
                    {/* 🧨 ELIMINAR / DESVINCULAR COLABORADOR */}
                      {canRemoveMember(m) && (
                        <button
                          onClick={() => handleRemoveMember(m)}
                          disabled={processing}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition disabled:opacity-50"
                          title="Eliminar colaborador"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}


                  </motion.div>
                ))}
              </div>

              {canInvite && (
                <p className="text-xs text-slate-400 text-center mt-4">
                  Puedes invitar nuevos colaboradores desde el botón "Invitar".
                </p>
              )}
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
