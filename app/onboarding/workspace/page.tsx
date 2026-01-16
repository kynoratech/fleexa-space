"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createWorkspace, getUserWorkspaceCount } from "@/lib/workspace";
import { getUserPlan, canCreateWorkspace, getWorkspaceLimitMessage } from "@/lib/plans";

type ColorOption = {
  key: string;
  name: string;
  ring: string;
  dot: string;
};

export default function CreateWorkspacePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [name, setName] = useState("");
  const [color, setColor] = useState("blue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = useMemo<ColorOption[]>(
    () => [
      { key: "blue", name: "Azul", ring: "ring-blue-500/30", dot: "bg-blue-600" },
      { key: "emerald", name: "Verde", ring: "ring-emerald-500/30", dot: "bg-emerald-600" },
      { key: "violet", name: "Morado", ring: "ring-violet-500/30", dot: "bg-violet-600" },
      { key: "slate", name: "Gris", ring: "ring-slate-500/30", dot: "bg-slate-700" },
    ],
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (!usr) {
        router.push("/login");
        return;
      }
      setUser(usr);
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white text-slate-700">
        Cargando...
      </div>
    );
  }

  async function handleCreate() {
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setError("Pon un nombre de al menos 3 caracteres.");
      return;
    }

    if (!user?.uid) {
      setError("No pudimos detectar tu sesión. Vuelve a iniciar sesión.");
      return;
    }

    setLoading(true);
    try {
      // Verificar plan del usuario
      const plan = await getUserPlan(user.uid);
      
      // Contar workspaces actuales
      const currentCount = await getUserWorkspaceCount(user.uid);
      
      // Validar límite de workspaces según plan
      if (!canCreateWorkspace(currentCount, plan)) {
        const message = getWorkspaceLimitMessage(plan);
        setError(message);
        setLoading(false);
        return;
      }
      
      // Crear workspace (en lib/workspace.ts)
      const workspaceId = await createWorkspace(trimmed, user.uid);

      //  Redirigir al dashboard
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      setError("No se pudo crear el espacio. Revisa permisos/reglas y vuelve a intentar.");
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* Top bar (minimal, elegante) */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
              <img
                src="/favicon.ico"
                alt="Fleexa Space"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Fleexa Space</p>
              <p className="text-[12px] text-slate-500">Configuración inicial</p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Omitir por ahora
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-12 gap-10 items-start">
          {/* Left: copy */}
          <section className="col-span-12 lg:col-span-5">
            <h1 className="text-3xl font-semibold tracking-tight">
              Crea tu espacio de trabajo
            </h1>
            <p className="text-slate-600 mt-3 leading-relaxed">
              Tu espacio es donde organizarás clientes, tareas y proyectos.
              Puedes invitar colaboradores y definir permisos más adelante.
            </p>

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-800">
                Consejo rápido
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Usa un nombre simple como <span className="font-medium">“Empresa Marketing”</span>{" "}
                o <span className="font-medium">“Equipo Contenidos”</span>.
              </p>
            </div>
          </section>

          {/* Right: form card */}
          <section className="col-span-12 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-slate-800">
                    Nombre del espacio
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Esto lo verán los miembros del equipo.
                  </p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Cebra Marketing"
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-800">
                    Color del espacio
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Solo afecta la apariencia (puedes cambiarlo luego).
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {colors.map((c) => {
                      const active = color === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setColor(c.key)}
                          className={`flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm transition
                            ${active ? `ring-4 ${c.ring} bg-slate-50` : "hover:bg-slate-50"}
                          `}
                        >
                          <span className={`h-3 w-3 rounded-full ${c.dot}`} />
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleSkip}
                    className="text-sm text-slate-600 hover:text-slate-900"
                    type="button"
                  >
                    Omitir por ahora
                  </button>

                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-sm font-medium disabled:opacity-60"
                    type="button"
                  >
                    {loading ? "Creando..." : "Crear espacio"}
                  </button>
                </div>

                {/* footer tiny */}
                <p className="text-xs text-slate-500">
                  Plan gratuito: hasta 4 espacios. (Límites avanzados los activamos después)
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
