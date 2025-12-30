"use client";
export const dynamic = "force-dynamic"; 


import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, XCircle } from "lucide-react";

export default function RetornoPago() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token_ws");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("failed");
      return;
    }

    fetch("/api/webpay/commit-transaction", {
      method: "POST",
      body: JSON.stringify({ token_ws: token }),
    })
      .then(res => res.json())
      .then(async data => {
        if (data.ok) {
          setStatus("success");

          // 🔥 Actualizar plan a PRO en Firestore
          const uid = localStorage.getItem("fleexa_uid"); // Lo guardaste al iniciar el pago
          if (uid) {
            await updateDoc(doc(db, "users", uid), { plan: "pro" });
          }

        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fafafa] text-center p-6">
      {status === "loading" && (
        <div>
          <h1 className="text-4xl font-black mb-2">Procesando pago...</h1>
          <p className="text-slate-500">No cierres esta ventana</p>
        </div>
      )}

      {status === "success" && (
        <div className="animate-fadeIn">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
          <h1 className="text-5xl font-black mb-2 text-slate-900">¡Pago recibido!</h1>
          <p className="text-lg text-slate-500 mb-6">Gracias por confiar en Fleexa Space</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-[0.97]"
          >
            Ir al Dashboard
          </button>
        </div>
      )}

      {status === "failed" && (
        <div className="animate-fadeIn">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-5xl font-black mb-2 text-slate-900">Pago fallido</h1>
          <p className="text-lg text-slate-500 mb-6">No se pudo completar la transacción</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.97]"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </main>
  );
}
