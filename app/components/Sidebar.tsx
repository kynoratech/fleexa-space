"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clientes", href: "/dashboard/clientes" },
  { label: "Proyectos", href: "/dashboard/proyectos" },
  { label: "Tareas", href: "/dashboard/tareas" },
  { label: "Presupuestos", href: "/dashboard/presupuestos" },
  { label: "Agenda", href: "/dashboard/agenda" },
  { label: "Ajustes", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen border-r border-slate-800 bg-slate-900/60 backdrop-blur-lg px-4 py-6 flex flex-col gap-8">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
          <img src="/favicon.ico" className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Fleexa</h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 rounded-lg text-sm transition
              ${
                pathname === item.href
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>

    </aside>
  );
}
