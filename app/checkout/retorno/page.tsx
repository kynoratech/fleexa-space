"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export const dynamic = "force-dynamic";

export default function RetornoPago() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const validatePayment = async () => {
      try {
        const token_ws = searchParams.get("token_ws");

        if (!token_ws) {
          setStatus("error");
          setMessage("Token de pago no encontrado");
          return;
        }

        // Validar pago con Webpay
        const res = await fetch("/api/webpay/commit-transaction", {
          method: "POST",
          body: JSON.stringify({ token_ws }),
        });

        const data = await res.json();

        console.log("Respuesta de Webpay:", { 
          ok: res.ok, 
          data,
          isSuccessful: data.isSuccessful,
          responseCode: data.responseCode,
          message: data.message
        });

        // Si la respuesta HTTP no es ok
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Error al procesar el pago");
          return;
        }

        // Si el pago no fue exitoso (response_code != 0)
        // IMPORTANTE: Revisar data.isSuccessful y response_code
        if (!data.isSuccessful || data.responseCode !== 0) {
          console.warn("⚠️ Pago rechazado. Response code:", data.responseCode, "isSuccessful:", data.isSuccessful);
          setStatus("error");
          setMessage(data.message || "El pago fue rechazado. Por favor intenta de nuevo.");
          return;
        }

        // Pago exitoso - actualizar plan a PRO
        const user = auth.currentUser;
        if (user) {
          console.log("✅ Actualizando usuario a plan PRO:", user.uid);
          // Usar setDoc con merge para crear o actualizar
          await setDoc(doc(db, "users", user.uid), {
            plan: "pro",
            paymentDate: new Date(),
            transactionId: data.response?.buy_order,
            email: user.email,
            displayName: user.displayName,
          }, { merge: true });
          console.log("✅ Plan actualizado exitosamente");
        }

        setStatus("success");
        setMessage("¡Pago exitoso! Bienvenido al plan PRO");

        // Redirigir al dashboard en 3 segundos
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err) {
        console.error("Error validando pago:", err);
        setStatus("error");
        setMessage("Error al procesar el pago");
      }
    };

    validatePayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1220] text-center p-6">
      {status === "loading" && (
        <>
          <Loader size={48} className="mb-4 text-blue-500 animate-spin" />
          <h1 className="text-3xl font-bold mb-2 text-slate-100">Procesando pago...</h1>
          <p className="text-slate-400">Por favor espera mientras validamos tu transacción</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle size={64} className="mb-4 text-emerald-500" />
          <h1 className="text-4xl font-bold mb-2 text-emerald-400">¡Pago Exitoso!</h1>
          <p className="text-lg text-slate-400 mb-6">{message}</p>
          <p className="text-sm text-slate-500">Redirigiendo al dashboard...</p>
          <a
            href="/dashboard"
            className="mt-8 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all active:scale-[0.97]"
          >
            Ir al Dashboard
          </a>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle size={64} className="mb-4 text-red-500" />
          <h1 className="text-4xl font-bold mb-2 text-red-400">Pago Rechazado</h1>
          <p className="text-lg text-slate-400 mb-6">{message}</p>
          <p className="text-sm text-slate-500 mb-6">Por favor intenta nuevamente o contacta con soporte</p>
          <div className="flex gap-4">
            <a
              href="/checkout"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all active:scale-[0.97]"
            >
              Intentar de Nuevo
            </a>
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all active:scale-[0.97]"
            >
              Volver al Dashboard
            </a>
          </div>
        </>
      )}
    </div>
  );
}

