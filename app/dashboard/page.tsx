"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

/* 🔹 WORKSPACE */
import WorkspaceTopBar from "../components/WorkspaceTopBar";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

/* 🔹 INVITACIONES */
import PendingInvitesBanner from "../components/PendingInvitesBanner";

/* 🔹 CARDS */
import WeekTasks from "../components/Cards/WeekTasks";
import UpcomingDeliveries from "../components/Cards/UpcomingDeliveries";
import QuickStats from "../components/Cards/QuickStats";
import ClientsPreview from "../components/Cards/ClientsPreview";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { workspace, loading: loadingWorkspace } = useActiveWorkspace();

  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => {
      if (!usr) router.push("/login");
      else setUser(usr);
    });
  }, [router]);

  if (!user || loadingWorkspace) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1220] text-slate-400">
        Cargando espacio de trabajo…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#0E1629]/80 backdrop-blur-xl border-r border-white/5 px-6 py-6 flex flex-col">
        {/* Logo */}
        <div className="mb-12 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <img
              src="/favicon.ico"
              alt="Fleexa Space Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Fleexa Space
            </p>
            <p className="text-[11px] text-slate-400">
              Workspace
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 text-sm flex-1">
          <SidebarLink href="/dashboard" label="Dashboard" active />
          <SidebarLink href="/dashboard/clientes" label="Clientes" />
          <SidebarLink href="/dashboard/proyectos" label="Proyectos" />
          <SidebarLink href="/dashboard/tareas" label="Tareas" />
          <SidebarLink href="/dashboard/presupuestos" label="Presupuestos" />
        </nav>

        {/* User */}
        <div className="pt-6 mt-auto">
          <p className="text-xs truncate text-slate-400">
            {user.email}
          </p>
          <button
            onClick={() => signOut(auth)}
            className="mt-2 text-xs text-red-400 hover:text-red-300 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 px-14 py-10 overflow-y-auto bg-gradient-to-br from-[#0B1220] via-[#0E1629] to-[#0B1220]">
        {/* CONTEXTO WORKSPACE */}
        <div className="mb-8">
          <WorkspaceTopBar />
        </div>

        {!workspace ? null : (
          <>
            {/* HEADER */}
            <header className="mb-12">
              <h1 className="text-3xl font-semibold tracking-tight">
                Resumen de esta semana
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Actividad, tareas y estado general de tu espacio de trabajo.
              </p>
            </header>

            {/* INVITACIONES */}
            <div className="mb-14">
              <PendingInvitesBanner />
            </div>

            {/* GRID */}
            <div className="grid grid-cols-3 gap-10">
              {/* LEFT */}
              <div className="col-span-2 space-y-10">
                <GlassCard>
                  <WeekTasks />
                </GlassCard>

                <GlassCard>
                  <CardHeader
                    title="Próximas entregas"
                    description="Fechas importantes que no debes olvidar"
                  />
                  <UpcomingDeliveries />
                </GlassCard>
              </div>

              {/* RIGHT */}
              <aside className="space-y-10">
                <GlassCard>
                  <CardHeader
                    title="Resumen rápido"
                    description="Vista general del estado actual"
                  />
                  <QuickStats />
                </GlassCard>

                <GlassCard>
                  <CardHeader
                    title="Clientes recientes"
                    description="Últimos contactos agregados"
                  />
                  <ClientsPreview />
                </GlassCard>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      {children}
    </div>
  );
}

function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-xs text-slate-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  gradient,
}: {
  title: string;
  value: string;
  subtitle?: string;
  gradient: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 bg-gradient-to-br ${gradient} overflow-hidden`}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" />

      <div className="relative z-10">
        <p className="text-sm opacity-80">{title}</p>
        <p className="text-3xl font-semibold mt-2">{value}</p>
        {subtitle && (
          <p className="text-xs opacity-70 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
  active?: boolean;
};

function SidebarLink({ href, label, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg transition text-sm ${
        active
          ? "bg-white/10 text-white font-medium"
          : "hover:bg-white/5 text-slate-400"
      }`}
    >
      {label}
    </Link>
  );
}
