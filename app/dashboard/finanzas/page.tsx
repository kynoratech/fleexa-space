"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection, onSnapshot, query, orderBy,
  doc, deleteDoc
} from "firebase/firestore";
import Link from "next/link";
import {
  PlusCircle, Wallet, LogOut, TrendingUp, TrendingDown, 
  CalendarDays, Receipt, ArrowUpRight, Search, Sparkles, Filter
} from "lucide-react";
import { motion } from "framer-motion";

import WorkspaceTopBar from "../../components/WorkspaceTopBar";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

type Movimiento = {
  id: string;
  userId: string;
  nombre: string;
  descripcion: string;
  valor: number;
  moneda: string;
  categoria: "ingreso" | "gasto";
  fecha: string;
  createdAt?: any;
};

export default function FinanzasPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspace } = useActiveWorkspace();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("CLP");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!workspace?.workspaceId) return;
    const ref = collection(db, "workspaces", workspace.workspaceId, "finanzas");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Movimiento));
      setMovimientos(data);
      setLoading(false);
    });
    return () => unsub();
  }, [workspace?.workspaceId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Obtener lista de monedas únicas presentes en los datos
  const availableCurrencies = useMemo(() => {
    const currencies = Array.from(new Set(movimientos.map(m => m.moneda)));
    return currencies.length > 0 ? currencies : ["CLP", "USD"];
  }, [movimientos]);

  // 🔹 KPIs filtrados por la moneda seleccionada
  const kpis = useMemo(() => {
    let ingresos = 0; let gastos = 0;
    movimientos
      .filter(m => m.moneda === selectedCurrency)
      .forEach(m => m.categoria === "ingreso" ? ingresos += m.valor : gastos += m.valor);
    return { ingresos, gastos, balance: ingresos - gastos };
  }, [movimientos, selectedCurrency]);

  const filteredMovimientos = useMemo(() => {
    const term = search.toLowerCase();
    return movimientos.filter(m => 
      (m.nombre?.toLowerCase().includes(term) || m.descripcion?.toLowerCase().includes(term)) &&
      m.moneda === selectedCurrency
    );
  }, [movimientos, search, selectedCurrency]);

  // No user check needed, workspace is required

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 font-sans">
      
      <aside className="w-64 bg-[#0E1629]/80 backdrop-blur-xl border-r border-white/5 px-6 py-6 flex flex-col fixed h-full z-20">
        <div className="mb-12 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg text-white">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Fleexa Space</p>
            <p className="text-[11px] text-slate-400">Workspace</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-sm flex-1">
          <SidebarLink href="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
          <SidebarLink href="/dashboard/clientes" label="Clientes" active={pathname.includes("/dashboard/clientes")} />
          <SidebarLink href="/dashboard/proyectos" label="Proyectos" active={pathname.includes("/dashboard/proyectos")} />
          <SidebarLink href="/dashboard/finanzas" label="Finanzas" active={pathname.includes("/dashboard/finanzas")} />
        </nav>

        <div className="pt-6 mt-auto border-t border-white/5">
          <p className="text-[11px] truncate text-slate-500 mb-2">{user?.email ?? ""}</p>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-xs text-red-400/80 hover:text-red-300 transition">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 px-14 py-10 min-h-screen bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220]">
        
        <div className="mb-8">
          <WorkspaceTopBar />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Gestión Multi-moneda</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Movimientos</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 🔹 SELECTOR DE MONEDA PROFESIONAL */}
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 transition-all focus-within:ring-1 focus-within:ring-white/20">
              <Filter size={14} className="text-slate-500 mr-2" />
              <select 
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer text-slate-200"
              >
                {availableCurrencies.map(curr => (
                  <option key={curr} value={curr} className="bg-[#0E1629]">{curr}</option>
                ))}
              </select>
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={16} />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 w-[200px] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Link
              href="/dashboard/finanzas/new"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg"
            >
              <PlusCircle size={16} />
              Nuevo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <KpiCard label="Ingresos" value={kpis.ingresos} color="text-emerald-400" icon={<TrendingUp size={24}/>} currency={selectedCurrency} />
          <KpiCard label="Gastos" value={kpis.gastos} color="text-red-400" icon={<TrendingDown size={24}/>} currency={selectedCurrency} />
          <KpiCard label="Balance" value={kpis.balance} color="text-white" icon={<Wallet size={24}/>} currency={selectedCurrency} />
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredMovimientos.length === 0 ? (
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-20 flex flex-col items-center text-center">
            <Receipt size={32} className="text-slate-600 mb-4" />
            <p className="text-slate-400 text-sm">No hay registros en {selectedCurrency}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMovimientos.map((m) => (
              <div key={m.id} className="group bg-[#0E1629]/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-indigo-500/40 hover:bg-[#0E1629]/80 transition-all duration-300 flex flex-col justify-between h-72 shadow-xl shadow-black/10">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-2xl border ${m.categoria === 'ingreso' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {m.categoria === 'ingreso' ? <TrendingUp size={24}/> : <TrendingDown size={24}/>}
                    </div>
                    <button 
                      onClick={() => { if(confirm("¿Eliminar?")) deleteDoc(doc(db, "finanzas", m.id)) }}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {m.nombre}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1 truncate uppercase tracking-widest font-medium">
                    {m.categoria}
                  </p>
                  <p className="text-2xl font-bold mt-4 text-white">
                    ${Number(m.valor).toLocaleString()} <span className="text-xs text-slate-500">{m.moneda}</span>
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fecha</p>
                    <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
                      <CalendarDays size={12}/> {m.fecha}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 font-bold text-[10px] text-slate-400">
                    {m.moneda}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2.5 rounded-xl transition-all text-sm ${
        active ? "bg-white/10 text-white font-medium" : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}

function KpiCard({ label, value, color, icon, currency }: { label: string, value: number, color: string, icon: any, currency: string }) {
  return (
    <div className="bg-[#0E1629]/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <div className={`${color} opacity-40`}>{icon}</div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${color}`}>
        ${value.toLocaleString()} <span className="text-sm font-normal text-slate-500 uppercase">{currency}</span>
      </p>
    </div>
  );
}