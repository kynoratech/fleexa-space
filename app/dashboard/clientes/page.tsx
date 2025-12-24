"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

type Client = {
  id: string;
  nombre: string;
  email?: string;
  createdAt?: any;
  createdByEmail?: string | null;
  createdByName?: string | null;
  createdByUid?: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let unsubClients: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setClients([]);
        setCurrentUserEmail(null);
        setLoading(false);
        return;
      }

      setCurrentUserEmail(user.email ?? null);

      const uid = user.uid;
      const ref = collection(db, "users", uid, "clients");
      const q = query(ref, orderBy("createdAt", "desc"));

      unsubClients?.();

      unsubClients = onSnapshot(q, (snap) => {
        const list: Client[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        setClients(list);
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      unsubClients?.();
    };
  }, []);

  const parseDate = (raw: any): Date | null => {
    if (!raw) return null;
    if (raw.toDate) return raw.toDate();
    if (typeof raw === "string") {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const formatDate = (raw: any) => {
    const d = parseDate(raw);
    if (!d) return "Fecha no disponible";
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const term = search.toLowerCase();
    return clients.filter((c) => {
      const name = c.nombre?.toLowerCase() ?? "";
      const mail = c.email?.toLowerCase() ?? "";
      return name.includes(term) || mail.includes(term);
    });
  }, [clients, search]);

  return (
    <main className="p-10 text-slate-900 w-full">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona tu cartera de clientes, contactos y oportunidades.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="hidden sm:block px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none min-w-[220px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Link
            href="/dashboard/clientes/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            Nuevo cliente
          </Link>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-slate-200/80 rounded-xl h-16"
            />
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && clients.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <div className="mx-auto mb-4 w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <p className="text-lg font-medium">Todavía no tienes clientes</p>
          <p className="text-sm mt-1">
            Comienza agregando tu primer cliente al sistema.
          </p>

          <Link
            href="/dashboard/clientes/new"
            className="mt-6 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
          >
            Crear cliente
          </Link>
        </div>
      )}

      {/* LISTA */}
      {!loading && clients.length > 0 && (
        <>
          {/* Buscador en mobile */}
          <div className="mb-4 sm:hidden">
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredClients.length === 0 ? (
            <p className="text-sm text-slate-500">
              No se encontraron clientes con ese criterio.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((c) => {
                const createdByYou =
                  currentUserEmail &&
                  c.createdByEmail &&
                  c.createdByEmail === currentUserEmail;

                const createdLabel = createdByYou
                  ? "Creado por ti"
                  : c.createdByName
                  ? `Creado por ${c.createdByName}`
                  : c.createdByEmail
                  ? `Creado por ${c.createdByEmail}`
                  : "Creador desconocido";

                return (
                  <Link
                    key={c.id}
                    href={`/dashboard/clientes/${c.id}`}
                    className="block bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-sky-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold">
                          {c.nombre}
                        </h2>
                        {c.email ? (
                          <p className="text-slate-500 text-sm mt-0.5">
                            {c.email}
                          </p>
                        ) : (
                          <p className="text-slate-400 text-xs mt-0.5">
                            Sin correo registrado
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 text-right">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
                          {formatDate(c.createdAt)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {createdLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
