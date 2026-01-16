"use client";

import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  UploadCloud, FileCheck, ArrowLeft, Tag, 
  Wallet, TrendingUp, TrendingDown, Sparkles,
  Landmark
} from "lucide-react";

export default function NewFinancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState("CLP");
  const [categoria, setCategoria] = useState<"ingreso" | "gasto">("ingreso");
  const [tags, setTags] = useState("");
  const [notas, setNotas] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const usr = auth.currentUser;
    if (!usr) router.push("/login");
    else setUser(usr);
  }, [router]);

  const validateForm = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!monto || Number(monto) <= 0) return "El monto debe ser mayor a 0";
    return null;
  };

  const save = async (e: any) => {
    e.preventDefault();
    if (!user?.uid) return alert("No autenticado");

    const error = validateForm();
    if (error) return alert(error);

    setSaving(true);

    try {
      await addDoc(collection(db, "finanzas"), {
        userId: user.uid,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        valor: Number(monto),
        moneda,
        categoria,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        fecha: new Date().toISOString().split("T")[0],
        notas,
        creadoPor: user.email,
        actualizadoPor: user.email,
        eliminado: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/dashboard/finanzas");
    } catch (err) {
      console.error(err);
      alert("Error guardando movimiento");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220] p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0E1629]/50 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-black/40"
      >
        {/* HEADER & BACK */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <button
              onClick={() => router.push("/dashboard/finanzas")}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition mb-4 text-[10px] uppercase font-black tracking-widest"
            >
              <ArrowLeft size={14} /> Volver a Finanzas
            </button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Wallet size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Nuevo Movimiento</h1>
            </div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-8">
          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Título del Registro</label>
              <input
                type="text"
                className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all text-sm text-white placeholder:text-slate-600"
                placeholder="Ej: Pago de Suscripción Anual"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Tipo de Flujo</label>
              <div className="flex p-1 bg-white/[0.03] border border-white/10 rounded-2xl h-[54px]">
                <button
                  type="button"
                  onClick={() => setCategoria("ingreso")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${categoria === "ingreso" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <TrendingUp size={14} /> Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => setCategoria("gasto")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${categoria === "gasto" ? "bg-red-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <TrendingDown size={14} /> Gasto
                </button>
              </div>
            </div>
          </div>

          {/* Monto y Moneda */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Monto de Operación</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</div>
                <input
                  type="number"
                  className="w-full pl-10 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all text-sm font-bold text-white placeholder:text-slate-600"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Divisa</label>
              <select
                className="w-full px-5 py-4 rounded-2xl bg-[#1a2236] border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all text-sm font-bold text-white appearance-none cursor-pointer"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
              >
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
                <option value="MXN">MXN</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Descripción y Detalles</label>
            <textarea
              className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all text-sm text-white placeholder:text-slate-600 min-h-[100px]"
              placeholder="Añade contexto sobre este movimiento..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Tags y Comprobante Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                <Tag size={12}/> Etiquetas
              </label>
              <input
                type="text"
                className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 focus:outline-none transition-all text-sm text-white placeholder:text-slate-600"
                placeholder="marketing, software, legal..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                <UploadCloud size={12}/> Comprobante
              </label>
              <label className="flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/20 hover:border-indigo-500/50 cursor-pointer transition-all">
                <span className="text-xs text-slate-400 truncate max-w-[150px]">
                  {file ? file.name : "Subir archivo..."}
                </span>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file ? <FileCheck size={18} className="text-emerald-400" /> : <UploadCloud size={18} className="text-indigo-400" />}
              </label>
            </div>
          </div>

          {/* BOTÓN FINAL */}
          <button
            disabled={saving}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-[1.5rem] font-bold text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {saving ? (
              <span className="flex items-center gap-2 animate-pulse">
                Procesando...
              </span>
            ) : (
              <>
                <Landmark size={18} />
                Confirmar Registro
              </>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}