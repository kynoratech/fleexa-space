"use client";

import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTaskPage() {
  const router = useRouter();
  const user = auth.currentUser;

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");

  const save = async (e: any) => {
    e.preventDefault();
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "tasks"), {
      titulo,
      fecha,
      createdAt: serverTimestamp(),
    });

    router.push("/dashboard/tareas");
  };

  return (
    <main className="min-h-screen p-6 text-white max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nueva tarea</h1>

      <form onSubmit={save} className="space-y-4">
        <input
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
          placeholder="Título"
          onChange={(e) => setTitulo(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
          onChange={(e) => setFecha(e.target.value)}
        />

        <button className="w-full py-3 bg-sky-500 text-black font-semibold rounded-xl">
          Crear tarea
        </button>
      </form>
    </main>
  );
}
