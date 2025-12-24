"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "projects");
    const q = query(ref, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  return (
    <main className="min-h-screen p-6 text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <Link
          href="/dashboard/proyectos/new"
          className="px-4 py-2 bg-emerald-500 rounded-xl text-black font-semibold"
        >
          Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 && (
        <p className="text-slate-400">No tienes proyectos aún.</p>
      )}

      <div className="grid gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/proyectos/${p.id}`}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition"
          >
            <h2 className="text-xl font-semibold">{p.nombre}</h2>
            <p className="text-slate-400 text-sm">{p.descripcion}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
