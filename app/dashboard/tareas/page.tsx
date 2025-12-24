"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "tasks");
    const q = query(ref, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  return (
    <main className="min-h-screen p-6 text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Tareas</h1>
        <Link
          href="/dashboard/tareas/new"
          className="px-4 py-2 bg-sky-500 rounded-xl text-black font-semibold"
        >
          Nueva tarea
        </Link>
      </div>

      <div className="grid gap-4">
        {tasks.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/tareas/${t.id}`}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition"
          >
            <h2 className="text-xl font-semibold">{t.titulo}</h2>
            <p className="text-slate-400 text-sm">{t.fecha}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
