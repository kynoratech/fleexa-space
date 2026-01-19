"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { Users, Briefcase, CheckCircle2, Zap } from "lucide-react";

type Counts = {
  clients: number;
  projects: number;
  tasks: number;
};

export default function QuickStats() {
  const [counts, setCounts] = useState<Counts>({
    clients: 0,
    projects: 0,
    tasks: 0,
  });

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const [clientsSnap, projectsSnap, tasksSnap] = await Promise.all([
        getCountFromServer(collection(db, "users", user.uid, "clients")),
        getCountFromServer(collection(db, "users", user.uid, "projects")),
        getCountFromServer(collection(db, "users", user.uid, "tasks")),
      ]);

      setCounts({
        clients: clientsSnap.data().count,
        projects: projectsSnap.data().count,
        tasks: tasksSnap.data().count,
      });
    };

    load();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header interno */}
      <div className="flex items-center gap-2 mb-6">
        <Zap size={14} className="text-amber-400 fill-amber-400/20" />
        <h3 className="text-[11px] font-black uppercase tracking-[2px] text-slate-500">
          Rendimiento Global
        </h3>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4">
        <Kpi
          label="Clientes"
          value={counts.clients}
          icon={<Users size={14} />}
          color="text-emerald-400"
          borderColor="border-emerald-500/20"
        />
        <Kpi
          label="Proyectos"
          value={counts.projects}
          icon={<Briefcase size={14} />}
          color="text-indigo-400"
          borderColor="border-indigo-500/20"
        />
        <Kpi
          label="Tareas"
          value={counts.tasks}
          icon={<CheckCircle2 size={14} />}
          color="text-amber-400"
          borderColor="border-amber-500/20"
        />
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  color,
  borderColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}) {
  return (
    <div className={`group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-xl bg-slate-900 border ${borderColor} flex items-center justify-center ${color} shadow-inner`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-bold text-white tracking-tighter mt-0.5">
            {value}
          </p>
        </div>
      </div>
      
      {/* Indicador visual de "salud" o tendencia (decorativo para el look premium) */}
      <div className="h-1 w-12 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full w-2/3 rounded-full opacity-50 bg-current ${color}`} />
      </div>
    </div>
  );
}