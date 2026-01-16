"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, UserPlus, ArrowUpRight, ShieldCheck, Users, LogOut } from "lucide-react";

/* 🔹 COMPONENTES DEL WORKSPACE */
import WorkspaceTopBar from "../../components/WorkspaceTopBar";

type Client = {
  id: string;
  nombre: string;
  email?: string;
  createdAt?: any;
  createdByEmail?: string | null;
};

export default function ClientsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Control de autenticación y carga de datos
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (usr) => {
      if (!usr) {
        router.push("/login");
      } else {
        setUser(usr);
        // Cargar clientes solo si hay usuario
        const ref = collection(db, "users", usr.uid, "clients");
        const q = query(ref, orderBy("createdAt", "desc"));
        
        return onSnapshot(q, (snap) => {
          setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
          setLoading(false);
        });
      }
    });
    return () => unsubAuth();
  }, [router]);

  const formatDate = (raw: any) => {
    const d = raw?.toDate ? raw.toDate() : (typeof raw === "string" ? new Date(raw) : null);
    if (!d || isNaN(d.getTime())) return "PENDIENTE";
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  };

  const filteredClients = useMemo(() => {
    const term = search.toLowerCase();
    return clients.filter(c => 
      c.nombre?.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term)
    );
  }, [clients, search]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 font-sans">
      
      {/* ================= SIDEBAR (Misma del Dashboard) ================= */}
      <aside className="w-64 bg-[#0E1629]/80 backdrop-blur-xl border-r border-white/5 px-6 py-6 flex flex-col fixed h-full">
        <div className="mb-12 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Fleexa Space</p>
            <p className="text-[11px] text-slate-400">Workspace</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-sm flex-1">
          <SidebarLink href="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
          <SidebarLink href="/dashboard/clientes" label="Clientes" active={pathname === "/dashboard/clientes"} />
          <SidebarLink href="/dashboard/proyectos" label="Proyectos" active={pathname === "/dashboard/proyectos"} />
          <SidebarLink href="/dashboard/finanzas" label="Finanzas" active={pathname === "/dashboard/finanzas"} />
        </nav>

        <div className="pt-6 mt-auto border-t border-white/5">
          <p className="text-[11px] truncate text-slate-500 mb-2">{user.email}</p>
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 text-xs text-red-400/80 hover:text-red-300 transition"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 ml-64 px-14 py-10 min-h-screen bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220]">
        
        <div className="mb-8">
          <WorkspaceTopBar />
        </div>

        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
            <p className="text-slate-400 text-sm mt-1">
              Administra tus contactos comerciales y base de datos.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={16} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 w-full sm:w-[260px] transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link
              href="/dashboard/clientes/new"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/10"
            >
              <UserPlus size={16} />
              Nuevo
            </Link>
          </div>
        </div>

        {/* LISTADO */}
        {loading ? (
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-20 flex flex-col items-center text-center">
            <Users size={32} className="text-slate-600 mb-4" />
            <p className="text-slate-400 text-sm">No hay registros que coincidan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClients.map((c) => {
              const isOwner = user.email === c.createdByEmail;
              return (
                <Link key={c.id} href={`/dashboard/clientes/${c.id}`}>
                  <div className="group bg-[#0E1629]/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-indigo-500/40 hover:bg-[#0E1629]/80 transition-all duration-300 flex flex-col justify-between h-72 shadow-xl shadow-black/10">
                    <div>
                      <div className="flex justify-between items-start mb-10">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-2xl">
                          {c.nombre.charAt(0)}
                        </div>
                        <ArrowUpRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
                      </div>
                      <h2 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {c.nombre}
                      </h2>
                      <p className="text-slate-400 text-xs mt-1 truncate">{c.email || "SIN EMAIL"}</p>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Creado</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">{formatDate(c.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        {isOwner && <ShieldCheck size={10} className="text-indigo-400" />}
                        <span className="text-[10px] font-bold text-slate-400">{isOwner ? "PROPIO" : "EQUIPO"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ================= COMPONENTES DE APOYO ================= */

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