"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  User, 
  Settings, 
  Layers, 
  Clock, 
  FileText,
  LogOut,
  Edit3,
  CheckCircle2,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

/* 🔹 COMPONENTE DE BARRA SUPERIOR */
import WorkspaceTopBar from "../../../components/WorkspaceTopBar";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function ProjectDetails() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { workspace } = useActiveWorkspace();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace?.workspaceId) return;

    const idString = Array.isArray(id) ? id[0] : id;
    if (!idString) {
      setLoading(false);
      return;
    }

    const ref = doc(db, "workspaces", workspace.workspaceId, "projects", idString);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
  }, [id, workspace?.workspaceId]);

  async function handleDelete() {
    if (!workspace?.workspaceId || !id) return;
    const idString = Array.isArray(id) ? id[0] : id;
    const ref = doc(db, "workspaces", workspace.workspaceId, "projects", idString);
    if (confirm("¿Seguro que deseas eliminar este proyecto? Esta acción no se puede deshacer.")) {
      await deleteDoc(ref);
      router.push("/dashboard/proyectos");
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
      <div className="animate-pulse text-indigo-400 font-bold tracking-widest text-xs uppercase">Sincronizando Proyecto...</div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1220] text-white">
      <p className="text-slate-400 mb-4">El proyecto no existe o ha sido movido.</p>
      <Link href="/dashboard/proyectos" className="text-indigo-400 underline">Volver a la lista</Link>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0E1629]/80 backdrop-blur-xl border-r border-white/5 px-6 py-6 flex flex-col fixed h-full z-20">
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
      <main className="flex-1 ml-64 px-14 py-10 bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220] min-h-screen">
        
        <div className="mb-8">
          <WorkspaceTopBar />
        </div>

        {/* NAVEGACIÓN Y ACCIONES */}
        <div className="flex items-center justify-between mb-10">
          <Link 
            href="/dashboard/proyectos" 
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/proyectos/${id}/edit`}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <Edit3 size={14} /> Editar Datos
            </Link>

            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600/80 hover:bg-red-500 border border-red-500/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/10 active:scale-95"
            >
              <Trash2 size={14} /> Eliminar Proyecto
            </button>
          </div>
        </div>

        {/* HEADER DEL PROYECTO */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              {project.estado || "En curso"}
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <Clock size={12} /> Creado el {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : 'Recientemente'}
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-white mb-6 leading-tight max-w-4xl">
            {project.nombre}
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
            {project.descripcion || "Sin descripción detallada disponible para este proyecto."}
          </p>
        </div>

        {/* GRILLA DE INFORMACIÓN TÉCNICA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <InfoCard 
            icon={<User size={18} className="text-blue-400" />} 
            label="Responsable" 
            value={project.responsable || "No asignado"} 
          />
          <InfoCard 
            icon={<DollarSign size={18} className="text-emerald-400" />} 
            label="Inversión" 
            value={`$${Number(project.valor).toLocaleString()}`} 
          />
          <InfoCard 
            icon={<Calendar size={18} className="text-pink-400" />} 
            label="Fecha Inicio" 
            value={project.fechaInicio || "Pendiente"} 
          />
          <InfoCard 
            icon={<CheckCircle2 size={18} className="text-purple-400" />} 
            label="Entrega" 
            value={project.fechaEntrega || "Pendiente"} 
          />
        </div>

        {/* SECCIONES DE DETALLE METODOLÓGICO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">
              <Settings size={16} /> Metodología Aplicada
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {project.metodologia || "No se ha especificado una metodología técnica para este flujo de trabajo."}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-teal-400 mb-6">
              <FileText size={16} /> Procedimientos Clave
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {project.procedimiento || "Los pasos operativos no han sido documentados aún."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= COMPONENTES DE APOYO ================= */

function InfoCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors group">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-[#0B1220] rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-white font-semibold tracking-tight truncate">{value}</p>
    </div>
  );
}

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
