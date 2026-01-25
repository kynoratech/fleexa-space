"use client";

import { useEffect, useState } from "react";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import Link from "next/link";
import { UserPlus, ChevronRight, User } from "lucide-react";

type Client = {
  id: string;
  nombre?: string;
  email?: string;
};

export default function ClientsPreview() {
  const { workspace } = useActiveWorkspace();
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState<number>(0);

  useEffect(() => {
    if (!workspace?.workspaceId) return;

    // Consulta para los 3 clientes más recientes
    const ref = collection(db, "workspaces", workspace.workspaceId, "clients");
    const q = query(ref, orderBy("createdAt", "desc"), limit(3));

    // Consulta para contar el total de clientes
    const unsubClients = onSnapshot(q, (snap) => {
      const list: Client[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setClients(list);
    });

    const unsubTotal = onSnapshot(ref, (snap) => {
      setTotalClients(snap.size);
    });

    return () => {
      unsubClients();
      unsubTotal();
    };
  }, [workspace?.workspaceId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header interno del componente */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <h3 className="text-[11px] font-black uppercase tracking-[2px] text-slate-500">
            CRM Reciente
          </h3>
        </div>

        <Link
          href="/dashboard/clientes/new"
          className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Nuevo cliente"
        >
          <UserPlus size={16} />
        </Link>
      </div>

      {/* Lista de clientes */}
      {workspace?.plan === "free" && totalClients > 3 && (
        <div className="mb-2 p-2 rounded-lg bg-yellow-900/40 border border-yellow-400/30 text-xs text-yellow-200 text-center">
          Solo puedes visualizar los 3 clientes más recientes con el plan Free. Actualiza a Pro para ver todos tus clientes.
        </div>
      )}
      <div className="flex-1 space-y-2">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
            <p className="text-[11px] font-medium text-slate-600 text-center italic">
              Sin registros aún
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/clientes/${c.id}`}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar circular con inicial */}
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[10px] shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    {c.nombre ? c.nombre.charAt(0).toUpperCase() : <User size={12} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-200 truncate tracking-tight">
                      {c.nombre || "Sin nombre"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate font-medium">
                      {c.email || "Sin correo"}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
            {/* Mostrar enlace 'ver más' si hay más de 3 clientes */}
            {totalClients > 3 && (
              <div className="flex justify-center mt-2">
                <Link
                  href="/dashboard/clientes"
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  Ver más
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Link (opcional: puedes dejarlo o quitarlo si solo quieres el 'ver más') */}
    </div>
  );
}