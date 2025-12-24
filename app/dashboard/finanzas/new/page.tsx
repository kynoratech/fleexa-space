"use client";

import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewFinancePage() {
  const router = useRouter();
  const user = auth.currentUser;

  const [tipo, setTipo] = useState("ingreso");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const save = async (e: any) => {
    e.preventDefault();
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "finanzas"), {
      tipo,
      monto: Number(monto),
      descripcion,
      createdAt: serverTimestamp(),
    });

    router.push("/dashboard/finanzas");
  };

  return (
    <main className="min-h-screen p-6 text-white max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nuevo movimiento</h1>

      <form onSubmit={save} className="space-y-4">
        <select
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>

        <input
          type="number"
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
          placeholder="Monto"
          onChange={(e) => setMonto(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
          placeholder="Descripción"
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <button className="w-full py-3 bg-amber-400 text-black rounded-xl font-semibold">
          Guardar
        </button>
      </form>
    </main>
  );
}
