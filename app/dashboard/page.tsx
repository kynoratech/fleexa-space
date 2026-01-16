"use client";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

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
import FinancesSummary from "../components/Cards/FinancesSummary";
import { motion } from "framer-motion";
import { PLAN_LIMITS } from "@/lib/plans";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { workspace, loading: loadingWorkspace } = useActiveWorkspace();
  const limits = PLAN_LIMITS[workspace?.plan === "pro" ? "pro" : "free"];

  useEffect(() => {
    return onAuthStateChanged(auth, async (usr) => {
      if (!usr) {
        router.push("/login");
        return;
      }

      setUser(usr);

      // ===== LIMITACIONES SEGÚN PLAN =====
      const uid = usr.uid;

      // contar uso real
      const clientsCount = (await getDocs(collection(db, "users", uid, "clients"))).size;
      const projectsCount = (await getDocs(collection(db, "users", uid, "projects"))).size;
      const exportsCount = (await getDocs(collection(db, "users", uid, "exports"))).size;

      // detectar plan actual
      const currentPlan = workspace?.plan === "pro" ? "pro" : "free";
      const limits = PLAN_LIMITS[currentPlan];

      // validar topes
      if (clientsCount >= limits.maxClients) {
        console.log("🚫 Límite de clientes alcanzado (Plan Free)");
        // aquí luego podrás bloquear UI si quieres, por ahora solo deja el log
      }

      if (projectsCount >= limits.maxProjects) {
        console.log("🚫 Límite de proyectos alcanzado (Plan Free)");
      }

      if (exportsCount >= limits.maxExportsPerMonth) {
        console.log("🚫 Límite de exports alcanzado (Plan Free)");
      }

      if (!limits.canInvite) {
        console.log("🚫 Invitaciones deshabilitadas para el plan Free");
      }

      if (!limits.canUseAI) {
        console.log("🚫 IA deshabilitada para el plan Free");
      }
      // ===== FIN LIMITACIONES =====


      // Detectar retorno desde Webpay y subir plan a PRO
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token_ws");

      if (token) {
        try {
          const res = await fetch("/api/webpay/commit-transaction", {
            method: "POST",
            body: JSON.stringify({ token_ws: token }),
          });
          const data = await res.json();

          if (data.ok && data.isSuccessful) {
            const uid = localStorage.getItem("fleexa_uid");
            if (uid) {
              await updateDoc(doc(db, "users", uid), { plan: "pro" });
              console.log("✅ Plan actualizado a PRO");
              
              // Remover token de URL
              window.history.replaceState({}, document.title, window.location.pathname);
              
              // Forzar refetch del workspace después de 1 segundo
              setTimeout(() => {
                setRefreshKey(prev => prev + 1);
              }, 1000);
            }
          }
        } catch (err) {
          console.error("Error al confirmar pago Webpay:", err);
        }
      }
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
    <div className="min-h-screen flex bg-[#0B1220] text-slate-100 relative overflow-hidden">
      {/* ================== BACKGROUND SYSTEM (DEPTH) ================== */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft auroras */}
        <div className="absolute -top-56 -left-40 h-[520px] w-[520px] rounded-full bg-indigo-600/14 blur-[120px]" />
        <div className="absolute top-1/3 -right-48 h-[560px] w-[560px] rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute -bottom-64 left-1/3 h-[680px] w-[680px] rounded-full bg-fuchsia-500/6 blur-[170px]" />

        {/* microgrid */}
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />

        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_0%,transparent_40%,rgba(0,0,0,0.55))]" />
      </div>

      {/* ================= SIDEBAR (SEGMENTED) ================= */}
      <aside className="w-72 px-5 py-6 flex flex-col relative">
        {/* outer shell */}
        <div className="absolute inset-y-0 left-0 w-[1px] bg-white/5" />

        {/* BRAND MODULE */}
        <div className="rounded-3xl border border-white/10 bg-[#0E1629]/75 backdrop-blur-2xl p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.35),transparent_55%)]" />
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg ring-1 ring-white/10">
              <img
                src="/favicon.ico"
                alt="Fleexa Space Logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-tight truncate">
                Fleexa Space
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                Command Workspace
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">Estado</div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Operativo
            </div>
          </div>
        </div>

        {/* NAV MODULE */}
        <div className="mt-4 rounded-3xl border border-white/10 bg-[#0E1629]/55 backdrop-blur-2xl p-3 shadow-[0_14px_44px_rgba(0,0,0,0.35)] relative">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Navegación
            </p>
          </div>
          <nav className="flex flex-col gap-1 text-sm px-2 pb-3">
            <SidebarLink href="/dashboard" label="Dashboard" active />
            <SidebarLink href="/dashboard/clientes" label="Clientes" />
            <SidebarLink href="/dashboard/proyectos" label="Proyectos" />
            <SidebarLink href="/dashboard/finanzas" label="finanzas" />
          </nav>
        </div>

        {/* ACCOUNT MODULE */}
        <div className="mt-auto rounded-3xl border border-white/10 bg-[#0E1629]/55 backdrop-blur-2xl p-4 shadow-[0_14px_44px_rgba(0,0,0,0.35)]">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-3">
            Cuenta
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs truncate text-slate-300">{user.email}</p>
            <button
              onClick={() => signOut(auth)}
              className="mt-3 w-full text-xs text-red-300 hover:text-red-200 transition rounded-xl py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN (APP SHELL) ================= */}
      <main className="flex-1 pr-6 py-6">
        {/* inner frame */}
        <div className="h-full rounded-[28px] border border-white/10 bg-[#0B1220]/55 backdrop-blur-2xl shadow-[0_22px_70px_rgba(0,0,0,0.50)] overflow-hidden relative">
          {/* top bar glow */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 bg-[radial-gradient(60%_70%_at_40%_0%,rgba(99,102,241,0.22),transparent_70%)]" />

          <div className="h-full px-12 py-10 overflow-y-auto">
            {/* CONTEXTO WORKSPACE */}
            <div className="mb-8">
              <WorkspaceTopBar />
            </div>

            {/* PLAN CHIP */}
            <div className="mb-6 flex justify-end">
              <div className="relative rounded-2xl p-[1px] bg-[linear-gradient(135deg,rgba(99,102,241,0.55),rgba(56,189,248,0.35),rgba(255,255,255,0.08))]">
                <div className="rounded-2xl bg-[#0E1629]/70 border border-white/10 px-4 py-2 text-xs text-slate-200 flex items-center gap-2">
                  {workspace?.plan === "pro" ? (
                    <>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
                        <span className="font-semibold">Plan Pro activo</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="opacity-90">🔵 Plan Free</span>
                      <button
                        onClick={() => router.push("/checkout")}
                        className="ml-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition flex items-center gap-1 shadow-[0_16px_40px_rgba(79,70,229,0.25)] border border-white/10"
                      >
                        Upgrade <ArrowRight className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ================= CONTENIDO NORMAL DEL DASHBOARD (TODO INTACTO) ================= */}
            {!workspace ? null : (
              <>
                {/* HEADER NEW HIERARCHY */}
                <header className="mb-12">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
                    Panel ejecutivo
                  </div>

                  <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-white/95 to-slate-400 bg-clip-text ">
                      Resumen de esta semana
                    </span>
                  </h1>

                  <div className="mt-2 flex items-center gap-4">
                    <p className="text-slate-400 text-sm max-w-xl">
                      Actividad, tareas y estado general de tu espacio de trabajo.
                    </p>

                    <div className="hidden lg:flex items-center gap-3 ml-auto">
                      <div className="h-[1px] w-24 bg-white/10" />
                      <div className="text-[11px] text-slate-400">
                        {workspace?.plan === "pro" ? "Nivel: PRO" : "Nivel: FREE"}
                      </div>
                    </div>
                  </div>

                  {/* divider */}
                  <div className="mt-6 h-[1px] w-full bg-white/10 relative">
                    <div className="absolute left-0 top-0 h-[1px] w-28 bg-gradient-to-r from-indigo-400/70 to-transparent" />
                  </div>
                </header>

                {/* INVITACIONES */}
                <div className="mb-14">
                  <PendingInvitesBanner />
                </div>

                {/* GRID (MISMA ESTRUCTURA) */}
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

                    <GlassCard>
                      <CardHeader
                        title="Finanzas"
                        description="Resumen de ingresos y gastos"
                      />
                      <FinancesSummary />
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

                {/* BOTÓN POST-PAGO */}
                {workspace?.plan === "pro" && (
                  <div className="mt-14 flex justify-center">
                    <motion.button
                      onClick={() => router.push("/dashboard")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold shadow-[0_18px_60px_rgba(16,185,129,0.18)] hover:opacity-95 transition-all flex items-center gap-2 border border-white/10"
                    >
                      <CheckCircle className="h-4 w-4" /> Ya estás en PRO
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= UI COMPONENTS (TODO ORIGINAL) ================= */

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[26px] p-[1px] bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06),rgba(99,102,241,0.12))] shadow-[0_18px_70px_rgba(0,0,0,0.40)]">
      {/* outer frame */}
      <div className="rounded-[26px] bg-[#0E1629]/55 border border-white/10 backdrop-blur-2xl">
        {/* inner inset surface */}
        <div className="rounded-[22px] m-[10px] bg-white/[0.04] border border-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {children}
        </div>
      </div>
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
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-indigo-400/80 shadow-[0_0_0_6px_rgba(99,102,241,0.12)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4 h-[1px] w-full bg-white/10" />
    </div>
  );
}

type SidebarLinkProps = { href: string; label: string; active?: boolean };

function SidebarLink({ href, label, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`group relative px-4 py-3 rounded-2xl transition text-sm border ${
        active
          ? "bg-white/10 text-white font-medium border-white/10"
          : "bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 border-transparent hover:border-white/10"
      }`}
    >
      {/* left notch */}
      {active && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-gradient-to-b from-indigo-400/80 to-sky-300/40" />
      )}
      <span className={`${active ? "ml-3" : ""}`}>{label}</span>

      {/* subtle right indicator */}
      <span
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full transition ${
          active ? "bg-indigo-400/80" : "bg-white/0 group-hover:bg-white/10"
        }`}
      />
    </Link>
  );
}
