"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useParams, useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  LogOut,
  ChevronRight
} from "lucide-react";

/* 🔹 COMPONENTES DEL WORKSPACE */
import WorkspaceTopBar from "../../../components/WorkspaceTopBar";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

type Client = {
  id: string;
  nombre: string;
  email?: string | null;
  phone?: string | null;
  createdAt?: any;
  createdByEmail?: string | null;
  createdByName?: string | null;
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params?.id as string;

  const { workspace } = useActiveWorkspace();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspace?.workspaceId) return;
    if (!id) return;
    const ref = doc(db, "workspaces", workspace.workspaceId, "clients", id);
    getDoc(ref)
      .then((snap) => {
        if (!snap.exists()) {
          setError("El registro solicitado no existe.");
        } else {
          setClient({ id: snap.id, ...(snap.data() as any) });
        }
      })
      .catch(() => setError("Error de conexión con la base de datos."))
      .finally(() => setLoading(false));
  }, [id, workspace?.workspaceId]);

  const formatDateLong = (raw: any) => {
    const d = raw?.toDate ? raw.toDate() : (typeof raw === "string" ? new Date(raw) : null);
    if (!d || isNaN(d.getTime())) return "Fecha no disponible";
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  };

  const handleDelete = async () => {
    if (!workspace?.workspaceId || !id) return;
    if (!confirm("¿Confirmas la eliminación permanente de este cliente?")) return;
    try {
      await deleteDoc(doc(db, "workspaces", workspace.workspaceId, "clients", id));
      router.push("/dashboard/clientes");
    } catch (err) {
      alert("Error al eliminar el registro.");
    }
  };

if (loading || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-slate-400">
        <p className="animate-pulse tracking-widest text-xs uppercase font-bold">Sincronizando datos...</p>
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

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-red-400">
            {error}
            <Link href="/dashboard/clientes" className="block mt-4 text-sm underline">Regresar al directorio</Link>
          </div>
        ) : client && (
          <div className="max-w-5xl">
            {/* BREADCRUMB / VOLVER */}
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
              <Link href="/dashboard/clientes" className="hover:text-indigo-400 transition-colors">Clientes</Link>
              <ChevronRight size={12} />
              <span className="text-slate-300">Expediente</span>
            </div>

            {/* HEADER DEL CLIENTE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-3xl font-bold shadow-xl shadow-indigo-500/20">
                  {client.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white mb-1">{client.nombre}</h1>
                  <p className="text-indigo-400 text-sm font-medium">{client.email || "Sin correo asociado"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/clientes/${id}/edit`}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  <Edit3 size={16} />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>

            {/* GRID DE INFORMACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* COLUMNA IZQUIERDA: DATOS PRINCIPALES */}
              <div className="md:col-span-2 space-y-8">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
                  <h3 className="text-lg font-semibold mb-8 flex items-center gap-2">
                    <User size={18} className="text-indigo-400" />
                    Detalles de Contacto
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <InfoBlock label="Correo Electrónico" value={client.email} icon={<Mail size={14}/>} />
                    <InfoBlock label="Teléfono / WhatsApp" value={client.phone} icon={<Phone size={14}/>} />
                  </div>
                </div>

                {/* Placeholder para futuras secciones (Proyectos, Notas, Facturas) */}
                <div className="border border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-slate-600">
                  <p className="text-sm font-medium italic">Historial de proyectos y tareas (Próximamente)</p>
                </div>
              </div>

              {/* COLUMNA DERECHA: META DATOS */}
              <aside className="space-y-6">
                <div className="bg-[#0E1629]/50 border border-white/5 rounded-3xl p-8">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Metadatos del Registro</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/5 rounded-lg"><Calendar size={16} className="text-slate-400"/></div>
                      <div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase">Fecha de Alta</p>
                        <p className="text-sm text-slate-200">{formatDateLong(client.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/5 rounded-lg"><User size={16} className="text-slate-400"/></div>
                      <div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase">Registrado por</p>
                        <p className="text-sm text-slate-200">{client.createdByName || client.createdByEmail || "Sistema"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link 
                  href="/dashboard/clientes"
                  className="flex items-center justify-center gap-2 w-full py-4 text-sm text-slate-500 hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-500/20 rounded-2xl"
                >
                  <ArrowLeft size={16} />
                  Volver al listado
                </Link>
              </aside>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ================= COMPONENTES INTERNOS ================= */

function InfoBlock({ label, value, icon }: { label: string, value?: string | null, icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-lg font-medium text-slate-200">
        {value || <span className="text-slate-600 italic text-sm">No registrado</span>}
      </p>
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