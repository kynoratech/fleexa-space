"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, UserPlus, Save, LogOut, Loader2 } from "lucide-react";
import { getUserPlan } from "@/lib/workspace";
import { canAddClient, getClientLimitMessage } from "@/lib/plans";
import WorkspaceTopBar from "../../../components/WorkspaceTopBar";

export default function NewClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (!usr) router.push("/login");
      else setUser(usr);
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!nombre.trim() || !user) return;

    setLoading(true);
    try {
      // Verificar plan del usuario
      const plan = await getUserPlan(user.uid);
      
      // Contar clientes actuales
      const clientsQuery = query(
        collection(db, "users", user.uid, "clients")
      );
      const clientsSnap = await getDocs(clientsQuery);
      const clientCount = clientsSnap.size;

      // Validar límite de clientes según plan
      if (!canAddClient(clientCount, plan)) {
        const message = getClientLimitMessage(plan);
        setError(message);
        setLoading(false);
        return;
      }

      const docRef = await addDoc(
        collection(db, "users", user.uid, "clients"),
        {
          nombre: nombre.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          createdAt: serverTimestamp(),
          createdByUid: user.uid,
          createdByEmail: user.email ?? null,
          createdByName: user.displayName ?? null,
        }
      );
      router.push(`/dashboard/clientes/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError("Error al crear el registro.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 font-sans">
      
      {/* ================= SIDEBAR ================= */}
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
          <SidebarLink href="/dashboard/clientes" label="Clientes" active={pathname.includes("/dashboard/clientes")} />
          <SidebarLink href="/dashboard/proyectos" label="Proyectos" active={pathname === "/dashboard/proyectos"} />
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

        <div className="max-w-3xl">
          {/* BOTÓN VOLVER */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al directorio
          </button>

          {/* HEADER */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <UserPlus size={20} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Alta de Cliente</h1>
            </div>
            <p className="text-slate-400 text-sm">
              Registra una nueva entidad comercial en tu espacio de trabajo.
            </p>
          </div>

          {/* FORMULARIO ESTILO GLASS */}
          <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl">
            
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 text-rose-300 text-sm">
                ⚠️ {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">
                Nombre o Razón Social
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                placeholder="Ej: Estudio Creativo Bruma"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">
                  Correo Electrónico
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="contacto@empresa.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">
                  Teléfono de contacto
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+56 9 ..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                />
              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Descartar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {loading ? "Registrando..." : "Guardar Cliente"}
              </button>
            </div>
          </form>
        </div>
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