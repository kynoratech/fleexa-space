"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const ref = doc(db, "users", user.uid, "clients", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as any;
        setNombre(data.nombre || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      } else {
        setError("El cliente no existe.");
      }

      setLoading(false);
    };

    load();
  }, [id, router]);

  const saveClient = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "clients", id as string), {
        nombre,
        email,
        phone,
      });

      router.push(`/dashboard/clientes/${id}`);
    } catch {
      setError("No se pudieron guardar los cambios.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="p-10 text-slate-700">
        <p className="animate-pulse">Cargando cliente...</p>
      </main>
    );
  }

  if (error && !nombre) {
    return (
      <main className="p-10">
        <h1 className="text-xl font-semibold text-red-600">{error}</h1>
        <Link
          href="/dashboard/clientes"
          className="mt-4 inline-block text-sky-600 hover:underline"
        >
          ← Volver a clientes
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full px-10 py-8">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Clientes
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Editar cliente
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Actualiza la información del contacto.
            </p>
          </div>

          <Link
            href={`/dashboard/clientes/${id}`}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Volver al cliente
          </Link>
        </div>

        {/* FORM */}
        <form
          onSubmit={saveClient}
          className="space-y-6 bg-white border border-slate-200 shadow-sm p-8 rounded-xl"
        >
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Correo</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Opcional"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Teléfono
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Opcional"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* BOTONES */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-sky-700 disabled:opacity-70"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <Link
              href={`/dashboard/clientes/${id}`}
              className="px-5 py-2.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
