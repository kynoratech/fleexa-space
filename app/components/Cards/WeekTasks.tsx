"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

/* ================= TYPES ================= */

type HistoryItem = {
  action: string;
  at: string;
};

type Task = {
  id: string;
  title: string;
  dueDate?: any;
  status?: "cancelled" | "in-progress" | "implemented";
  assigneeId?: string;
  history?: HistoryItem[];
};

/* ================= COMPONENT ================= */

export default function WeekTasks({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [openActivityId, setOpenActivityId] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState<Task | null>(null);

  /* ================= DATA ================= */

  useEffect(() => {
    if (!workspaceId) return;

    const q = query(
      collection(db, "workspaces", workspaceId, "tasks"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setTasks(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
      );
    });

    return unsub;
  }, [workspaceId]);

  const addHistory = (task: Task, action: string) => [
    ...(task.history || []),
    { action, at: new Date().toISOString() },
  ];

  /* ================= ACTIONS ================= */

  const handleAdd = async () => {
    const user = auth.currentUser;
    if (!user || !title.trim()) return;

    await addDoc(
      collection(db, "workspaces", workspaceId, "tasks"),
      {
        title: title.trim(),
        createdAt: serverTimestamp(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        status: "in-progress",
        assigneeId: user.uid,
        history: [
          { action: "Te asignaste esta tarea", at: new Date().toISOString() },
        ],
      }
    );

    setTitle("");
    setDueDate("");
  };

  const moveTask = async (task: Task, newStatus: Task["status"]) => {
    if (task.status === newStatus) return;

    await updateDoc(
      doc(db, "workspaces", workspaceId, "tasks", task.id),
      {
        status: newStatus,
        history: addHistory(
          task,
          `Moviste la tarea a ${humanizeStatus(newStatus)}`
        ),
      }
    );
  };

  const saveEdit = async (task: Task) => {
    await updateDoc(
      doc(db, "workspaces", workspaceId, "tasks", task.id),
      {
        title: editTitle,
        dueDate: editDate ? new Date(editDate).toISOString() : null,
        history: addHistory(task, "Editaste la tarea"),
      }
    );

    setEditingId(null);
  };

  const removeTask = async (task: Task) => {
    if (!confirm("¿Eliminar esta tarea?")) return;

    await deleteDoc(
      doc(db, "workspaces", workspaceId, "tasks", task.id)
    );
  };

  const parseDate = (raw: any) => {
    if (!raw) return "";
    if (typeof raw === "string") return raw.split("T")[0];
    if (raw?.toDate) return raw.toDate().toISOString().split("T")[0];
    return "";
  };

  /* ================= UI ================= */

  const columns: {
    key: Task["status"];
    label: string;
    color: string;
  }[] = [
    { key: "cancelled", label: "Pendiente", color: "text-red-400" },
    { key: "in-progress", label: "En curso", color: "text-yellow-300" },
    { key: "implemented", label: "Completado", color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Tareas de la semana</h3>
          <p className="text-xs text-slate-400">
            Actividad, tareas y estado general
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs"
        >
          Añadir
        </button>
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          placeholder="Agregar tarea..."
          className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="rounded-lg bg-white/5 px-3 py-2 text-xs"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragTask && moveTask(dragTask, col.key)}
            className="rounded-xl bg-white/5 p-3 min-h-[240px] space-y-3"
          >
            <h4 className={`text-xs font-medium ${col.color}`}>
              {col.label}
            </h4>

            {tasks
              .filter((t) => t.status === col.key)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragTask(task)}
                  onDragEnd={() => setDragTask(null)}
                  className="rounded-lg bg-white/5 p-3 w-full cursor-grab active:cursor-grabbing group"
                >
                  {editingId === task.id ? (
                    <>
                      <input
                        className="w-full bg-transparent text-sm mb-1"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        type="date"
                        className="text-xs bg-transparent"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                      <button
                        onClick={() => saveEdit(task)}
                        className="text-xs text-blue-400 mt-2"
                      >
                        Guardar
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">{task.title}</p>
                      <p className="text-xs text-slate-400">
                        {parseDate(task.dueDate) || "Sin fecha"}
                      </p>

                      <div className="mt-2 flex justify-between">
                        <button
                          onClick={() => {
                            setEditingId(task.id);
                            setEditTitle(task.title);
                            setEditDate(parseDate(task.dueDate));
                          }}
                          className="text-xs text-slate-400 opacity-0 group-hover:opacity-100"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => removeTask(task)}
                          className="text-xs text-red-400 opacity-0 group-hover:opacity-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

const humanizeStatus = (status?: Task["status"]) => {
  if (status === "cancelled") return "Pendiente";
  if (status === "in-progress") return "En curso";
  if (status === "implemented") return "Completado";
  return "";
};
