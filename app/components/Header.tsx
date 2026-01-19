"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function Header() {
  const router = useRouter();

  const logout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6">
      
      <h2 className="text-lg font-semibold">Dashboard</h2>

      <button
        onClick={logout}
        className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 text-slate-300"
      >
        Cerrar sesión
      </button>

    </header>
  );
}
