"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  dueDate?: any;
};

type TaskWithState = Task & {
  date: Date;
  state: "next" | "upcoming" | "overdue";
};

export default function UpcomingDeliveries() {
  const [tasks, setTasks] = useState<TaskWithState[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = collection(db, "users", user.uid, "tasks");
    const q = query(ref, orderBy("dueDate", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const now = new Date();

      const parsed = snap.docs
        .map((d) => {
          const data = d.data() as any;
          const date =
            typeof data.dueDate === "string"
              ? new Date(data.dueDate)
              : data.dueDate?.toDate?.();

          return date
            ? {
                id: d.id,
                title: data.title,
                date,
              }
            : null;
        })
        .filter(Boolean) as TaskWithState[];

      let nextMarked = false;

      const withState: TaskWithState[] = parsed.map((t) => {
        if (t.date < now) {
          return { ...t, state: "overdue" };
        }

        if (!nextMarked) {
          nextMarked = true;
          return { ...t, state: "next" };
        }

        return { ...t, state: "upcoming" };
      });

      setTasks(withState);
    });

    return unsub;
  }, []);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).replace(".", ""); // Quita el punto de las abreviaciones para un look más limpio

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 opacity-40">
        <Calendar size={20} className="mb-2" />
        <p className="text-xs font-bold uppercase tracking-widest">Sin entregas</p>
      </div>
    );
  }

  return (
    <div className="relative px-2">
      {/* Línea vertical de fondo con degradado */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/50 via-white/10 to-transparent" />

      <ul className="space-y-6">
        {tasks.map((task) => (
          <li key={task.id} className="relative pl-10 group">
            
            {/* Indicador Visual (Dot) */}
            <div className="absolute left-0 top-1.5 z-10">
              <div className={`h-[10px] w-[10px] rounded-full ring-4 ring-[#0B0F1A] transition-all duration-300 ${
                task.state === "overdue" 
                  ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" 
                  : task.state === "next"
                  ? "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.6)]"
                  : "bg-slate-700 group-hover:bg-slate-500"
              }`} />
            </div>

            {/* Bloque de Contenido */}
            <div className="flex flex-col gap-1">
              {/* Header: Fecha y Badges */}
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-[1.5px] ${
                  task.state === "overdue" ? "text-rose-400" : "text-slate-500"
                }`}>
                  {formatDate(task.date)}
                </span>

                {task.state === "overdue" && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    <AlertCircle size={10} /> Atrasado
                  </span>
                )}

                {task.state === "next" && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                    Siguiente entrega
                  </span>
                )}
              </div>

              {/* Título de la tarea */}
              <p className={`text-sm tracking-tight transition-colors ${
                task.state === "overdue"
                  ? "text-slate-500 font-medium italic line-through decoration-slate-700"
                  : task.state === "next"
                  ? "text-white font-bold"
                  : "text-slate-300 group-hover:text-white font-medium"
              }`}>
                {task.title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}