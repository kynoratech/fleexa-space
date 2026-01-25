"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { auth, db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  X, 
  LogOut, 
  Loader2, 
  UserCircle, 
  Mail, 
  Phone 
} from "lucide-react";

/* 🔹 COMPONENTES DEL WORKSPACE */
import WorkspaceTopBar from "../../../../components/WorkspaceTopBar";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const { workspace } = useActiveWorkspace();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspace?.workspaceId || !id) return;
    const ref = doc(db, "workspaces", workspace.workspaceId, "clients", id as string);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          setNombre(data.nombre || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
        } else {
          setError("El registro solicitado no existe.");
        }
      })
      .catch(() => setError("Error al conectar con la base de datos."))
      .finally(() => setLoading(false));
  }, [id, workspace?.workspaceId]);

  const saveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.workspaceId || !id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "workspaces", workspace.workspaceId, "clients", id as string), {
        nombre: nombre.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      router.push(`/dashboard/clientes/${id}`);
    } catch {
      setError("No se pudieron guardar los cambios. Intenta de nuevo.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-indigo-500 animate-spin" size={32} />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0E1629]/80 backdrop-blur-xl border-r border-white/5 px-6 py-6 flex flex-col fixed h-full">
        <div className="mb-12 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <p className="text-sm font-semibold tracking-tight">Fleexa Space</p>
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
          <Link 
            href={`/dashboard/clientes/${id}`}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-8 group w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Cancelar y volver al perfil
          </Link>

          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Editar Expediente</h1>
            <p className="text-slate-400 text-sm">Modifica los detalles de contacto de <span className="text-indigo-400 font-medium">{nombre}</span>.</p>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <X size={18} />
              {error}
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={saveClient} className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl shadow-black/20">
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">
                <UserCircle size={14} className="text-indigo-500" />
                Nombre Completo o Razón Social
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">
                  <Mail size={14} className="text-indigo-500" />
                  Correo Electrónico
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 ml-1">
                  <Phone size={14} className="text-indigo-500" />
                  Teléfono
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link
                href={`/dashboard/clientes/${id}`}
                className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Descartar cambios
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Sincronizando..." : "Actualizar Cliente"}
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