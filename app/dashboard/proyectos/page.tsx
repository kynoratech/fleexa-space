"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  FolderPlus, 
  Briefcase, 
  ChevronRight, 
  Clock, 
  LogOut, 
  Layers 
} from "lucide-react";

/* 🔹 COMPONENTES DEL WORKSPACE */
import WorkspaceTopBar from "../../components/WorkspaceTopBar";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function ProjectsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspace } = useActiveWorkspace();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!workspace?.workspaceId) return;
    const ref = collection(db, "workspaces", workspace.workspaceId, "projects");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [workspace?.workspaceId]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0E1629]/80 backdrop-blur-xl border-r border-white/5 px-6 py-6 flex flex-col fixed h-full">
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <p className="text-sm font-semibold tracking-tight">Fleexa Space</p>
        </div>

        <nav className="flex flex-col gap-1 text-sm flex-1">
          <SidebarLink href="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
          <SidebarLink href="/dashboard/clientes" label="Clientes" active={pathname.includes("/dashboard/clientes")} />
          <SidebarLink href="/dashboard/proyectos" label="Proyectos" active={pathname.includes("/dashboard/proyectos")} />
          <SidebarLink href="/dashboard/finanzas" label="Finanzas" active={pathname === "/dashboard/finanzas"} />

        </nav>

        <div className="pt-6 mt-auto border-t border-white/5">
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-xs text-red-400/80 hover:text-red-300 transition">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 ml-64 px-14 py-10 min-h-screen bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220]">
        
        <div className="mb-8">
          <WorkspaceTopBar />
        </div>

        {/* HEADER SECCIÓN */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Proyectos</h1>
            <p className="text-slate-400 text-sm mt-1">Gestión de flujo de trabajo y activos de producción.</p>
          </div>

          <Link
            href="/dashboard/proyectos/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 w-fit"
          >
            <FolderPlus size={18} />
            Nuevo Proyecto
          </Link>
        </div>

        {/* LISTADO DE PROYECTOS */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-[2.5rem] bg-white/5 border border-white/10 p-20 flex flex-col items-center text-center">
            <div className="p-4 bg-white/5 rounded-2xl mb-4 border border-white/5">
                <Briefcase size={32} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white">No hay proyectos activos</h3>
            <p className="text-slate-400 text-sm mb-8">Comienza creando tu primer proyecto para organizar tus tareas.</p>
            <Link
              href="/dashboard/proyectos/new"
              className="px-6 py-2.5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-all text-slate-200"
            >
              Crear Proyecto
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 max-w-5xl">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/proyectos/${p.id}`}
                className="group flex items-center justify-between p-6 rounded-[1.5rem] bg-[#0E1629]/50 backdrop-blur-xl border border-white/5 hover:border-indigo-500/40 hover:bg-[#0E1629]/80 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {p.nombre}
                    </h2>
                    <p className="text-slate-400 text-sm line-clamp-1 max-w-md mt-0.5">
                        {p.descripcion || "Sin descripción detallada."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        <Clock size={12} /> Actualizado
                    </span>
                    <span className="text-xs text-slate-300">Recientemente</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-all duration-300">
                    <ChevronRight size={20} className="text-slate-400 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ================= COMPONENTES UI ================= */

function SidebarLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2.5 rounded-xl transition-all text-sm flex items-center gap-3 ${
        active
          ? "bg-white/10 text-white font-medium shadow-sm"
          : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}