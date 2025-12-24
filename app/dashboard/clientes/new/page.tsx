"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión.");
      return;
    }

    setLoading(true);

    try {
      const uid = user.uid;

      const docRef = await addDoc(
        collection(db, "users", uid, "clients"),
        {
          nombre: nombre.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          createdAt: serverTimestamp(),
          createdByUid: uid,
          createdByEmail: user.email ?? null,
          createdByName: user.displayName ?? null,
        }
      );

      router.push(`/dashboard/clientes/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 text-slate-900 w-full max-w-3xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Nuevo cliente
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Registra un nuevo contacto en tu cartera.
          </p>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white border border-slate-200 shadow-sm p-8 rounded-2xl"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Nombre del cliente
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            placeholder="Ej: Estudio Creativo Bruma"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Correo
            </label>
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
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/clientes")}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-70"
          >
            {loading ? "Guardando..." : "Crear cliente"}
          </button>
        </div>
      </form>
    </main>
  );
}
