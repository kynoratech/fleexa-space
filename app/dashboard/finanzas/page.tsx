"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection, onSnapshot, query, orderBy,
  doc, setDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";
import Link from "next/link";
import {
  Trash2, PlusCircle, Wallet,
  LogOut, TrendingUp, TrendingDown, CalendarDays, FileText,
  ArrowLeft,
  Receipt
} from "lucide-react";
import { motion } from "framer-motion";

type Movimiento = {
  id: string;
  userId: string;
  nombre: string;
  descripcion: string;
  valor: number;
  moneda: string;
  categoria: "ingreso" | "gasto";
  fecha: string;
  notas: string;
  createdAt?: any;
  updatedAt?: any;
  eliminado?: boolean;
};

export default function FinanzasPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{uid:string, email:string} | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  /* ========== AUTH ========== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (!usr?.uid) {
        router.push("/login");
      } else {
        setUser({ uid: usr.uid, email: usr.email! });
      }
    });
    return () => unsub();
  }, [router]);

  /* ========== FIRESTORE LISTENER ========== */
  useEffect(() => {
    if (!user?.uid) return;

    const ref = collection(db, "finanzas");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => d.data()).map((docData, i) => {
        const id = snap.docs[i].id;
        return {
          id,
          userId: docData.userId,
          nombre: docData.nombre ?? "Sin título",
          descripcion: docData.descripcion ?? "Sin descripción",
          valor: Number(docData.valor) || 0,
          moneda: docData.moneda ?? "CLP",
          categoria: docData.categoria === "ingreso" ? "ingreso" : "gasto",
          fecha: docData.fecha ?? new Date().toISOString().split("T")[0],
          notas: docData.notas ?? "",
          createdAt: docData.createdAt,
          updatedAt: docData.updatedAt,
          eliminado: docData.eliminado ?? false
        } satisfies Movimiento;
      }).filter(m => m.userId === user.uid && !m.eliminado);

      setMovimientos(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  /* ========== CREATE ========== */
  async function handleCreate() {
    const usr = auth.currentUser;
    if (!usr?.uid) return alert("Debes iniciar sesión");

    const id = crypto.randomUUID();
    const ref = doc(db, "finanzas", id);

    await setDoc(ref, {
      userId: usr.uid,
      nombre: "",
      descripcion: "",
      valor: 0,
      moneda: "CLP",
      categoria: "gasto",
      fecha: new Date().toISOString().split("T")[0],
      notas: "",
      notasInternas: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      eliminado: false
    });

    // Como aún no tienes vista edit, lo dejamos sin ruta 404
    alert("Movimiento creado correctamente");
  }

  /* ========== DELETE ========== */
  async function handleDelete(id: string) {
    const usr = auth.currentUser;
    if (!usr?.uid) return alert("Debes iniciar sesión");

    const ref = doc(db, "finanzas", id);
    if (confirm("¿Eliminar este movimiento?")) {
      await deleteDoc(ref); // hard delete real, puedes cambiar a soft luego si quieres
    }
  }

  /* ========== KPIs ========== */
  const kpis = useMemo(() => {
    let ingresos = 0;
    let gastos = 0;

    movimientos.forEach(m => {
      if (m.categoria === "ingreso") ingresos += m.valor;
      else gastos += m.valor;
    });

    const balance = ingresos - gastos;
    const total = ingresos + gastos;

    return { ingresos, gastos, balance, total };
  }, [movimientos]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-indigo-400 text-xs font-bold uppercase tracking-widest">
      Cargando Finanzas...
    </div>
  );

  /* ========== UI ========== */
  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0E1629]/80 border-r border-white/5 px-6 py-6 flex flex-col fixed h-full z-20">
        <div className="mb-12 flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Wallet size={20} className="text-white"/>
          </div>
          <p className="text-sm font-semibold">Fleexa Space</p>
        </div>

        <nav className="flex flex-col gap-1 text-sm flex-1">
          <Link href="/dashboard" className="px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-400">Dashboard</Link>
          <Link href="/dashboard/finanzas" className="px-3 py-2.5 rounded-xl bg-white/10 text-white font-medium">Finanzas</Link>
        </nav>

        <div className="pt-6 mt-auto border-t border-white/5">
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-xs text-red-400/80 hover:text-red-300">
            <LogOut size={14}/> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-64 px-14 py-10 overflow-y-auto bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={14}/> Volver
          </Link>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg active:scale-95"
          >
            <PlusCircle size={14}/> Nuevo Movimiento
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <FinKpi label="Ingresos" value={`$${kpis.ingresos.toLocaleString()} CLP`} icon={<TrendingUp size={18}/>}/>
          <FinKpi label="Gastos" value={`$${kpis.gastos.toLocaleString()} CLP`} icon={<TrendingDown size={18}/>}/>
          <FinKpi label="Balance" value={`$${kpis.balance.toLocaleString()} CLP`} icon={<Wallet size={18}/>}/>
          <FinKpi label="Total" value={`$${kpis.total.toLocaleString()} CLP`} icon={<Receipt size={18}/>}/>
        </div>

        {/* LISTADO */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid gap-4 max-w-5xl">
          {movimientos.map(m => (
            <div key={m.id} className="flex items-center justify-between p-6 rounded-2xl bg-[#111827]/60 border border-white/5 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-5">
                {m.categoria === "ingreso"
                  ? <TrendingUp size={22} className="text-green-400"/>
                  : <TrendingDown size={22} className="text-red-400"/>}

                <div>
                  <h2 className="text-lg font-semibold text-white">{m.nombre || "Sin nombre"}</h2>
                  <p className="text-slate-400 text-xs">{m.descripcion}</p>
                  <p className="text-white text-sm font-bold mt-1">${m.valor.toLocaleString()} {m.moneda}</p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <CalendarDays size={10}/> {m.fecha}
                  </p>
                </div>
              </div>

              <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300">
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </motion.div>

        {movimientos.length === 0 && <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-6">No hay movimientos</p>}
      </main>
    </div>

  );
}

/* ========== KPI FINANZAS ========== */
function FinKpi({label, value, icon}:{label:string, value:string, icon:any}) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-4">
      <div className="p-2 bg-black/20 rounded-lg text-indigo-400">{icon}</div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <p className="text-white font-semibold text-sm truncate">{value}</p>
      </div>
    </div>
  );
}
