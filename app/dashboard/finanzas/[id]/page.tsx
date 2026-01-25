"use client";
export const dynamic = "force-dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";

export default function FinanceDetails() {
  const { id } = useParams();
  const { workspace } = useActiveWorkspace();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!workspace?.workspaceId || !id) return;

    const idString = Array.isArray(id) ? id[0] : id;
    const ref = doc(db, "workspaces", workspace.workspaceId, "finanzas", idString);
    getDoc(ref).then((d) => setItem({ id: d.id, ...d.data() }));
  }, [id, workspace?.workspaceId]);

  if (!item) return <p className="text-white p-6">Cargando...</p>;

  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">
        {item.tipo.toUpperCase()} - ${item.monto}
      </h1>

      <p className="text-slate-300">{item.descripcion}</p>
    </main>
  );
}
