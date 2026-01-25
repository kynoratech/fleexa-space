"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function CalendarPage() {
  const { workspace } = useActiveWorkspace();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!workspace?.workspaceId) return;

    const ref = collection(db, "workspaces", workspace.workspaceId, "tasks");
    return onSnapshot(ref, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [workspace?.workspaceId]);

  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Calendario</h1>

      <div className="space-y-4">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="p-3 bg-slate-900 border border-slate-800 rounded-xl"
          >
            <p className="font-semibold">{t.titulo}</p>
            <p className="text-slate-400 text-sm">{t.fecha}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
