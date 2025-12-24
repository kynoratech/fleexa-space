"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function FinanzasPage() {
  const [items, setItems] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "finanzas");
    const q = query(ref, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  return (
    <main className="min-h-screen p-6 text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Finanzas</h1>
        <Link
          href="/dashboard/finanzas/new"
          className="px-4 py-2 bg-amber-400 text-black rounded-xl font-semibold"
        >
          Nuevo movimiento
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((i) => (
          <Link
            key={i.id}
            href={`/dashboard/finanzas/${i.id}`}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-600"
          >
            <p className="font-semibold">{i.tipo.toUpperCase()} - ${i.monto}</p>
            <p className="text-slate-400 text-sm">{i.descripcion}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
