"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { 
  Layers, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  ListChecks, 
  ArrowLeft, 
  FileText, 
  ChevronRight,
  LogOut,
  Target,
  Zap
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function NewProjectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspace } = useActiveWorkspace();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    valor: "",
    responsable: "",
    metodologia: "",
    procedimiento: "",
    estado: "planificación",
    fechaInicio: "",
    fechaEntrega: ""
  });

  // No need for user state, workspace is used

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate() {
    if (!workspace?.workspaceId || !form.nombre.trim()) return;

    const projectId = crypto.randomUUID();
    const ref = doc(db, "workspaces", workspace.workspaceId, "projects", projectId);

    try {
      await setDoc(ref, {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        valor: Number(form.valor) || 0,
        responsable: form.responsable.trim(),
        metodologia: form.metodologia.trim(),
        procedimiento: form.procedimiento.trim(),
        estado: form.estado,
        fechaInicio: form.fechaInicio,
        fechaEntrega: form.fechaEntrega,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      router.push(`/dashboard/proyectos/${projectId}`);
    } catch (error) {
      console.error("Error al crear:", error);
    }
  }

  // Removed user check as it's not needed

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
      <main className="flex-1 ml-64 px-8 md:px-14 py-10 bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220] min-h-screen">
        
        <Link
          href="/dashboard/proyectos"
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition mb-8 text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Volver a proyectos
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-5 mb-12">
            <div className="h-14 w-14 rounded-[1.25rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <Layers size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Nuevo Proyecto</h1>
              <p className="text-slate-400 text-sm">Configura los parámetros técnicos y comerciales</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="col-span-1 md:col-span-2">
              <FormLabel icon={<Target size={14}/>} label="Nombre del Proyecto" color="text-indigo-400" />
              <input name="nombre" placeholder="Ej: Desarrollo E-commerce Premium" className="form-input-custom" onChange={handleChange} />
            </div>

            <div>
              <FormLabel icon={<DollarSign size={14}/>} label="Inversión Estimada" color="text-emerald-400" />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input name="valor" type="number" placeholder="0.00" className="form-input-custom pl-8" onChange={handleChange} />
              </div>
            </div>

            <div>
              <FormLabel icon={<UserCheck size={14}/>} label="Project Manager" color="text-blue-400" />
              <input name="responsable" placeholder="Nombre del encargado" className="form-input-custom" onChange={handleChange} />
            </div>

            {/* SELECT CORREGIDO */}
            <div>
              <FormLabel icon={<Zap size={14}/>} label="Estado Inicial" color="text-amber-400" />
              <select 
                name="estado" 
                className="form-input-custom appearance-none cursor-pointer bg-[#0E1629]" 
                onChange={handleChange}
              >
                <option value="planificación" className="bg-[#0E1629] text-white">Planificación</option>
                <option value="en progreso" className="bg-[#0E1629] text-white">En progreso</option>
                <option value="revisión" className="bg-[#0E1629] text-white">Revisión</option>
                <option value="detenido" className="bg-[#0E1629] text-white">Detenido</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel icon={<Calendar size={14}/>} label="Inicio" color="text-pink-400" />
                <input name="fechaInicio" type="date" className="form-input-custom text-xs" onChange={handleChange} />
              </div>
              <div>
                <FormLabel icon={<Calendar size={14}/>} label="Entrega" color="text-purple-400" />
                <input name="fechaEntrega" type="date" className="form-input-custom text-xs" onChange={handleChange} />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <FormLabel icon={<FileText size={14}/>} label="Breve Descripción" color="text-slate-400" />
              <textarea name="descripcion" placeholder="Alcance y objetivos..." className="form-input-custom h-24 resize-none" onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-between items-center mt-16 pt-8 border-t border-white/5">
            <Link href="/dashboard/proyectos" className="text-sm text-slate-500 hover:text-white transition font-medium">
              Descartar borrador
            </Link>

            <button
              onClick={handleCreate}
              className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 group"
            >
              Iniciar Proyecto
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.section>
      </main>

      <style jsx>{`
        .form-input-custom {
          width: 100%;
          background: #0E1629 !important; /* Fondo sólido para evitar transparencias raras en móviles */
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 0.85rem 1.25rem;
          font-size: 0.875rem;
          color: white;
          transition: all 0.2s;
        }
        .form-input-custom:focus {
          outline: none;
          background: #161F35 !important;
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
        }
        /* Esto corrige el problema de las opciones blancas con fondo blanco en muchos navegadores */
        select.form-input-custom option {
          background-color: #0B1220;
          color: white;
          padding: 10px;
        }
        .form-input-custom::placeholder {
          color: #475569;
        }
        /* Ajuste para inputs de fecha (iconos blancos) */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function FormLabel({ icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${color}`}>
      {icon} {label}
    </label>
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