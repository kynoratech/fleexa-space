"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function RetornoPagoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  // 🔒 Evita doble ejecución (StrictMode / re-render)
  const hasCommitted = useRef(false);

  useEffect(() => {
    const validatePayment = async () => {
      try {
        if (hasCommitted.current) return;
        hasCommitted.current = true;

        const token_ws = searchParams.get("token_ws");

        if (!token_ws) {
          setStatus("error");
          setMessage("Token de pago no encontrado");
          return;
        }

        const res = await fetch("/api/webpay/commit-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token_ws }),
        });

        const data = await res.json();

        // ✅ Validación correcta (alineada con el backend real)
        if (!res.ok || !data?.ok) {
          setStatus("error");
          setMessage(data?.message || "El pago fue rechazado");
          return;
        }

        // ✅ ÉXITO REAL
        setStatus("success");
        setMessage("¡Pago exitoso! Bienvenido al plan PRO");

        // 🔄 Recarga completa para refrescar plan desde Neon
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);

      } catch (err) {
        console.error("❌ Error validando pago:", err);
        setStatus("error");
        setMessage("Error al procesar el pago");
      }
    };

    validatePayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1220] text-center p-6">
      
      {status === "loading" && (
        <>
          <Loader size={48} className="mb-4 text-blue-500 animate-spin" />
          <h1 className="text-3xl font-bold text-slate-100">Procesando pago…</h1>
          <p className="text-slate-400">Validando tu transacción</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle size={64} className="mb-4 text-emerald-500" />
          <h1 className="text-4xl font-bold text-emerald-400">¡Pago exitoso!</h1>
          <p className="text-slate-400 mb-6">{message}</p>
          <p className="text-sm text-slate-500">Redirigiendo al dashboard…</p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle size={64} className="mb-4 text-red-500" />
          <h1 className="text-4xl font-bold text-red-400">Pago rechazado</h1>
          <p className="text-slate-400 mb-6">{message}</p>

          <div className="flex gap-4">
            <a
              href="/checkout"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500"
            >
              Intentar de nuevo
            </a>
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600"
            >
              Ir al dashboard
            </a>
          </div>
        </>
      )}

    </div>
  );
}
