"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, ArrowLeft, Lock, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase"; // ← para obtener UID y guardarlo en localStorage

export default function CheckoutPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const prices = {
    monthly: { amount: "9.990", label: "al mes" },
    yearly: { amount: "99.900", label: "al año (ahorras $19.980)" }
  };

  // --- LÓGICA DE PAGO WEBPAY (sin tocar UI) ---
  const handlePay = async () => {
    const user = auth.currentUser;
    if (!user?.uid) {
      console.error("No hay usuario autenticado");
      return;
    }

    // Guardar UID para actualizar el plan después del pago
    localStorage.setItem("fleexa_uid", user.uid);

    try {
      const res = await fetch("/api/webpay/create-transaction", { method: "POST" });
      const data = await res.json();

      if (data.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        console.error("Error Webpay:", data.error);
      }
    } catch (err) {
      console.error("Fallo request Webpay:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 font-sans selection:bg-indigo-100">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 border border-slate-100 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Finalizar suscripción</h2>
              <p className="text-xs text-slate-500 font-medium">Selecciona tu ciclo de facturación</p>
            </div>
          </div>

          {/* SELECTOR MENSUAL / ANUAL */}
          <div className="p-1 bg-slate-100 rounded-2xl flex mb-8">
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${billingCycle === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Mensual
            </button>
            <button 
              onClick={() => setBillingCycle("yearly")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${billingCycle === "yearly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Anual 
              <span className="bg-emerald-100 text-emerald-600 text-[9px] px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>

          {/* DETALLE DEL PLAN */}
          <div className="bg-slate-50 rounded-3xl p-6 mb-6 border border-slate-100 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={billingCycle}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Plan Seleccionado</span>
                    <h3 className="text-lg font-black text-slate-900">Fleexa Pro</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600">${prices[billingCycle].amount}</span>
                    <span className="block text-[10px] text-slate-400 font-medium">{prices[billingCycle].label}</span>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {["Clientes ilimitados", "Proyectos y tareas PRO", "Exportación PDF", "Soporte Prioritario"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                      <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* BOTÓN Y SEGURIDAD (tu UI intacta, solo conectamos el pago) */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
              <p className="text-[11px] text-indigo-900/70 leading-relaxed">
                Pago seguro vía <strong>Webpay Plus</strong>. Suscripción {billingCycle === "monthly" ? "mensual" : "anual"} cancelable en cualquier momento.
              </p>
            </div>

            <motion.button 
              onClick={handlePay} // ← conectado a Webpay
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
            >
              Suscribirse ahora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <div className="flex flex-col items-center gap-2">
              <img src="/images.png" alt="Webpay" className="h-8 opacity-1000" />
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                <Lock className="h-3 w-3" /> Transacción Encriptada SSL
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
