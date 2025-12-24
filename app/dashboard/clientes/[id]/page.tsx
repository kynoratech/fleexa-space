"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Client = {
  id: string;
  nombre: string;
  email?: string | null;
  phone?: string | null;
  createdAt?: any;
  createdByEmail?: string | null;
  createdByName?: string | null;
  createdByUid?: string;
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const ref = doc(db, "users", user.uid, "clients", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Este cliente no existe o fue eliminado.");
        } else {
          setClient({ id: snap.id, ...(snap.data() as any) });
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del cliente.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const parseDate = (raw: any): Date | null => {
    if (!raw) return null;
    if (raw.toDate) return raw.toDate();
    if (typeof raw === "string") {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const formatDateLong = (raw: any) => {
    const d = parseDate(raw);
    if (!d) return "Fecha no disponible";
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este cliente permanentemente?")) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "clients", id));
      router.push("/dashboard/clientes");
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el cliente.");
    }
  };

  if (loading) {
    return (
      <main className="p-10 text-slate-700">
        <p className="animate-pulse">Cargando cliente...</p>
      </main>
    );
  }

  if (error || !client) {
    return (
      <main className="p-10 text-slate-900">
        <h1 className="text-xl font-semibold text-red-600 mb-4">
          {error || "No se encontró este cliente."}
        </h1>
        <Link
          href="/dashboard/clientes"
          className="inline-block text-sm text-sky-600 hover:underline"
        >
          ← Volver a clientes
        </Link>
      </main>
    );
  }

  const creatorText =
    client.createdByName ??
    client.createdByEmail ??
    "Usuario desconocido";

  return (
    <main className="p-10 text-slate-900 w-full max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-1">
            Cliente
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {client.nombre}
          </h1>
          {client.email && (
            <p className="text-slate-500 text-sm mt-1">{client.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <Link
            href={`/dashboard/clientes/${id}/edit`}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700"
          >
            Eliminar cliente
          </button>
        </div>
      </div>

      {/* META + DETALLE */}
      <div className="grid gap-6 md:grid-cols-[1.3fr,0.9fr]">
        {/* Datos principales */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Información de contacto
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs uppercase mb-1">
                Nombre
              </p>
              <p className="text-slate-900">{client.nombre}</p>
            </div>

            <div>
              <p className="text-slate-500 text-xs uppercase mb-1">
                Correo
              </p>
              <p className="text-slate-900">
                {client.email || "Sin correo registrado"}
              </p>
            </div>

            <div>
              <p className="text-slate-500 text-xs uppercase mb-1">
                Teléfono
              </p>
              <p className="text-slate-900">
                {client.phone || "Sin teléfono registrado"}
              </p>
            </div>
          </div>
        </section>

        {/* Meta / resumen */}
        <aside className="space-y-4">
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Resumen
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-[11px] text-slate-500">Creado el</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDateLong(client.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Creado por</p>
                <p className="text-sm text-slate-900">{creatorText}</p>
              </div>
            </div>
          </section>

          <Link
            href="/dashboard/clientes"
            className="inline-flex items-center text-sm text-sky-600 hover:underline"
          >
            ← Volver a la lista de clientes
          </Link>
        </aside>
      </div>
    </main>
  );
}
