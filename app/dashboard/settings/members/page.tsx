"use client";

import { useState } from "react";
import { inviteMember } from "@/lib/workspace";
import { useAuth } from "@/lib/useAuth";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function MembersPage() {
  const { user } = useAuth();
  const { workspace, loading } = useActiveWorkspace();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="p-6 text-slate-400">
        Cargando miembros…
      </div>
    );
  }

  if (!workspace || !user) {
    return (
      <div className="p-6 text-slate-400">
        No hay un espacio de trabajo activo
      </div>
    );
  }

  async function handleInvite() {
    if (!user || !workspace) return;
    if (!email.trim()) return;

    setSubmitting(true);

    await inviteMember({
      workspaceId: workspace.workspaceId,
      email: email.trim(),
      role,
      invitedBy: user.uid,
    });

    setEmail("");
    setSubmitting(false);
    alert("Invitación enviada");
  }


  return (
    <main className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Miembros del equipo
      </h1>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 space-y-4">
        <div>
          <p className="text-sm text-slate-400">
            Espacio actual
          </p>
          <p className="text-sm font-medium text-white">
            {workspace.name}
          </p>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-4">
          <h2 className="text-sm font-medium text-slate-300">
            Invitar colaborador
          </h2>

          <input
            type="email"
            placeholder="correo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-slate-950 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full rounded-md bg-slate-950 border border-white/10 px-3 py-2 text-sm text-white"
          >
            <option value="editor">Editor (puede editar)</option>
            <option value="viewer">Viewer (solo lectura)</option>
          </select>

          <button
            onClick={handleInvite}
            disabled={submitting || !email}
            className="w-full rounded-md bg-sky-600 hover:bg-sky-500 transition px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Invitar"}
          </button>
        </div>
      </div>
    </main>
  );
}
