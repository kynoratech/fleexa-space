"use client";
export const dynamic = "force-dynamic";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Save, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { workspace } = useActiveWorkspace();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!workspace?.workspaceId) return;

    const idString = Array.isArray(id) ? id[0] : id;
    if (!idString) {
      router.push("/dashboard/proyectos");
      return;
    }
    const ref = doc(db, "workspaces", workspace.workspaceId, "projects", idString);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          valor: data.valor?.toString() || "",
          responsable: data.responsable || "",
          metodologia: data.metodologia || "",
          procedimiento: data.procedimiento || "",
          estado: data.estado || "planificación",
          fechaInicio: data.fechaInicio || "",
          fechaEntrega: data.fechaEntrega || ""
        });
      }
      setLoading(false);
    });
  }, [router, id, workspace?.workspaceId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!workspace?.workspaceId || !id) return;

    const idString = Array.isArray(id) ? id[0] : id;
    const ref = doc(db, "workspaces", workspace.workspaceId, "projects", idString);

    await setDoc(ref, {
      ...form,
      valor: Number(form.valor) || 0,
      updatedAt: serverTimestamp()
    }, { merge: true });

    router.push(`/dashboard/proyectos/${idString}`);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-indigo-400 text-xs font-bold uppercase tracking-widest">
      Cargando Proyecto...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0B1220] text-slate-100 p-10 font-sans">
      <Link href={`/dashboard/proyectos/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 text-sm">
        <ArrowLeft size={16} /> Volver
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl bg-[#0E1629]/40 border border-white/5 rounded-[2rem] p-10 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Editar Proyecto</h1>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-indigo-400 mb-2 block">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-24" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-emerald-400 mb-2 block">Valor</label>
            <input type="number" name="valor" value={form.valor} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-blue-400 mb-2 block">Responsable</label>
            <input name="responsable" value={form.responsable} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-amber-400 mb-2 block">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
              <option value="planificación">Planificación</option>
              <option value="en progreso">En progreso</option>
              <option value="revisión">Revisión</option>
              <option value="completado">Completado</option>
              <option value="detenido">Detenido</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-pink-400 mb-2 block">Fecha Inicio</label>
            <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-teal-400 mb-2 block">Metodología</label>
            <textarea name="metodologia" value={form.metodologia} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-20" />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-bold uppercase text-cyan-400 mb-2 block">Procedimiento</label>
            <textarea name="procedimiento" value={form.procedimiento} onChange={handleChange} className="w-full bg-[#0E1629] border border-white/10 rounded-xl px-4 py-3 text-sm text-white h-28" />
          </div>

        </div>

        <div className="flex justify-end mt-10">
          <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-500/10">
            <Save size={16} /> Guardar Cambios
          </button>
        </div>
      </motion.section>
    </main>
  );
}
