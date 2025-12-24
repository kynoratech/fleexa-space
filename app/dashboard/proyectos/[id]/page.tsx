"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProjectDetails() {
  const { id } = useParams();
  const user = auth.currentUser;

  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!user || !id) return;

    const idString = Array.isArray(id) ? id[0] : id;
    const ref = doc(db, "users", user.uid, "projects", idString);
    getDoc(ref).then((d) => setProject({ id: d.id, ...d.data() }));
  }, [id, user]);

  if (!project)
    return <p className="text-white p-6">Cargando proyecto...</p>;

  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">{project.nombre}</h1>
      <p className="text-slate-300">{project.descripcion}</p>
    </main>
  );
}
