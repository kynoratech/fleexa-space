"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Shield, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ open, onClose }: Props) {
  const { workspace } = useActiveWorkspace();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "admin">("viewer");
  const [loading, setLoading] = useState(false);

  if (!workspace) return null;

  async function handleInvite() {
    if (!email || !workspace) return;
    try {
      setLoading(true);
      await addDoc(collection(db, "invitations"), {
        email: email.toLowerCase().trim(),
        role,
        workspaceId: workspace.workspaceId,
        invitedAt: serverTimestamp(),
        status: "pending",
      });
      setEmail("");
      setRole("viewer");
      onClose();
    } catch (err) {
      console.error("Invite error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay con desenfoque cinematográfico */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B0E14]/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-[#1E293B] border border-white/10 shadow-2xl shadow-black/50"
          >
            {/* Decoración superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500" />

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Invitar colaborador</h2>
                  <p className="text-slate-400 text-xs mt-1 font-medium">
                    Añade un nuevo miembro a <span className="text-indigo-400">{workspace.name}</span>
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Input de Email */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>

                {/* Selector de Rol */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                    Nivel de acceso
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                    >
                      <option value="viewer">Viewer · Solo puede ver</option>
                      <option value="editor">Editor · Puede crear y editar</option>
                      <option value="admin">Admin · Control total</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInvite}
                  disabled={loading || !email}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Enviar invitación"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}