"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function TaskDetails() {
  const { id } = useParams();
  const user = auth.currentUser;

  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    if (!user || !id) return;

    const taskId = Array.isArray(id) ? id[0] : id;
    const ref = doc(db, "users", user.uid, "tasks", taskId);
    getDoc(ref).then((d) => setTask({ id: d.id, ...d.data() }));
  }, [id, user]);

  if (!task)
    return <p className="text-white p-6">Cargando...</p>;

  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">{task.titulo}</h1>
      <p className="text-slate-300">{task.fecha}</p>
    </main>
  );
}
