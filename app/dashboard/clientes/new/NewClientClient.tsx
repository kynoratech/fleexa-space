"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, UserPlus, Save, LogOut, Loader2 } from "lucide-react";

import WorkspaceTopBar from "../../../components/WorkspaceTopBar";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function NewClientPage() {
  const { workspace } = useActiveWorkspace();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  /* ===============================
     AUTH
  =============================== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (!usr) {
        router.push("/login");
        return;
      }
      setUser(usr);
    });
    return () => unsub();
  }, [router]);

  /* ===============================
     SUBMIT
  =============================== */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!user || !workspace || !nombre.trim()) return;

  setLoading(true);

  try {
    const res = await fetch("/api/internal/create-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseUid: user.uid,
        workspace: {
          id: workspace.workspaceId,
          name: workspace.name,
        },
        nombre: nombre.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Error al crear cliente");
    }

    router.push("/dashboard/clientes");
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Error inesperado");
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
          <SidebarLink
            href="/dashboard/clientes"
            label="Clientes"
            active={pathname.includes("/dashboard/clientes")}
          />
          <SidebarLink href="/dashboard/proyectos" label="Proyectos" active={pathname === "/dashboard/proyectos"} />
          <SidebarLink href="/dashboard/finanzas" label="Finanzas" active={pathname === "/dashboard/finanzas"} />
        </nav>

        <div className="pt-6 mt-auto border-t border-white/5">
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 text-xs text-red-400/80 hover:text-red-300 transition"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 ml-64 px-14 py-10 min-h-screen bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220]">
        <div className="mb-8">
          <WorkspaceTopBar />
        </div>

        <div className="max-w-3xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition text-sm mb-8"
          >
            <ArrowLeft size={16} /> Volver al directorio
          </button>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <UserPlus size={20} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl font-semibold">Alta de Cliente</h1>
            </div>
            <p className="text-slate-400 text-sm">
              Registra una nueva entidad comercial en tu espacio de trabajo.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem]"
          >
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 text-rose-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Nombre o Razón Social"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo"
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono"
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => router.back()} className="text-slate-400">
                Descartar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 px-8 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save />}
                {loading ? "Registrando..." : "Guardar Cliente"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

/* ================= COMPONENTE SIDEBAR ================= */

function SidebarLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2.5 rounded-xl text-sm ${
        active ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}
