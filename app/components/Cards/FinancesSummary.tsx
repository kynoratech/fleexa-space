"use client";

import { useEffect, useState, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

type Movimiento = {
  id: string;
  userId: string;
  nombre: string;
  descripcion: string;
  valor: number;
  moneda: string;
  categoria: "ingreso" | "gasto";
  fecha: string;
  createdAt?: any;
};

export default function FinancesSummary() {
  const { workspace } = useActiveWorkspace();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace?.workspaceId) {
      setLoading(false);
      return;
    }

    const ref = collection(db, "workspaces", workspace.workspaceId, "finanzas");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Movimiento));
      setMovimientos(data);
      setLoading(false);
    });

    return () => unsub();
  }, [workspace?.workspaceId]);

  // Calcular KPIs (últimos 30 días, todas las monedas)
  const kpis = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalIngresos = 0;
    let totalGastos = 0;
    let ingresosCLP = 0;
    let gastosCLP = 0;

    movimientos.forEach((m) => {
      const fecha = new Date(m.fecha || m.createdAt?.toDate?.());
      if (fecha >= thirtyDaysAgo) {
        if (m.categoria === "ingreso") {
          totalIngresos += m.valor;
          if (m.moneda === "CLP") ingresosCLP += m.valor;
        } else {
          totalGastos += m.valor;
          if (m.moneda === "CLP") gastosCLP += m.valor;
        }
      }
    });

    return {
      ingresos: ingresosCLP,
      gastos: gastosCLP,
      balance: ingresosCLP - gastosCLP,
      totalIngresos,
      totalGastos,
    };
  }, [movimientos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gradient-to-r from-white/5 to-transparent rounded-2xl animate-pulse" />
        <div className="h-20 bg-gradient-to-r from-white/5 to-transparent rounded-2xl animate-pulse" />
        <div className="h-20 bg-gradient-to-r from-white/5 to-transparent rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ingresos */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Ingresos (30 días)</p>
            <p className="text-lg font-semibold text-emerald-400">
              {formatCurrency(kpis.ingresos)}
            </p>
          </div>
        </div>
      </div>

      {/* Gastos */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all group">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <TrendingDown size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Gastos (30 días)</p>
            <p className="text-lg font-semibold text-red-400">
              {formatCurrency(kpis.gastos)}
            </p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div
        className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
          kpis.balance >= 0
            ? "bg-sky-500/10 border-sky-500/20 hover:border-sky-500/40"
            : "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-xl border flex items-center justify-center ${
              kpis.balance >= 0
                ? "bg-sky-500/20 border-sky-500/30"
                : "bg-amber-500/20 border-amber-500/30"
            }`}
          >
            <Wallet
              size={20}
              className={kpis.balance >= 0 ? "text-sky-400" : "text-amber-400"}
            />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Balance (30 días)</p>
            <p
              className={`text-lg font-semibold ${
                kpis.balance >= 0 ? "text-sky-400" : "text-amber-400"
              }`}
            >
              {formatCurrency(kpis.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/finanzas"
        className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-600/30 text-indigo-300 text-sm font-medium transition-all group"
      >
        Ver detalle completo
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
