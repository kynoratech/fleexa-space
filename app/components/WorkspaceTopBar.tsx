"use client";

import { useState } from "react";
import { ChevronDown, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";
import InviteButton from "../components/invitations/InviteButton";

export default function WorkspaceTopBar() {
  const { workspace, loading } = useActiveWorkspace();
  const [openMembers, setOpenMembers] = useState(false);

  if (loading) return null;

  // SIN WORKSPACE → Onboarding (igual que antes)
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

  const canInvite = workspace.role === "owner" || workspace.role === "admin";
  const memberCount = workspace.members?.length || 0;

  return (
    <>
      {/* TOP BAR (igual a la original, solo que el botón ahora abre modal) */}
      <div className="mb-10 border-b border-slate-200 pb-5 flex items-start justify-between">

        {/* LEFT */}
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-3 w-3 rounded-full"
            style={{
              backgroundColor: workspace.color === "blue" ? "#2563eb" : workspace.color,
            }}
          />
          <div>
            <button className="flex items-center gap-1 text-xl font-semibold tracking-tight">
              {workspace.name}
              <ChevronDown size={18} className="text-slate-500" />
            </button>

            <p className="text-sm text-slate-500 mt-1">
              Rol:{" "}
              <span className="font-medium text-slate-700 capitalize">
                {workspace.role}
              </span>{" "}
              ·{" "}
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

          {canInvite && <InviteButton />}
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
              {/* HEADER */}
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

              {/* BODY */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {workspace.members && workspace.members.length > 0 ? (
                  workspace.members.map((m: string, i: number) => (
                    <motion.div
                      key={m + i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-3 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {workspace.role}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No hay miembros agregados aún
                  </p>
                )}
              </div>

              {/* FOOTER */}
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
