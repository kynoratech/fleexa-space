"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface ActiveWorkspace {
  [x: string]: any;
  workspaceId: string;
  name: string;
  color?: string;
  role: WorkspaceRole;
}

export function useActiveWorkspace() {
  const [workspace, setWorkspace] = useState<ActiveWorkspace | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkspace = useCallback(async (user: any) => {
    if (!user) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ memberships del usuario (QUERY)
      const membersQuery = query(
        collection(db, "workspaceMembers"),
        where("userId", "==", user.uid)
      );

      const membersSnap = await getDocs(membersQuery);

      if (membersSnap.empty) {
        setWorkspace(null);
        setLoading(false);
        return;
      }

      // 2️⃣ primer workspace
      const memberDoc = membersSnap.docs[0].data();
      const workspaceId = memberDoc.workspaceId;

      // 3️⃣ workspace por ID (GET)
      const wsRef = doc(db, "workspaces", workspaceId);
      const wsSnap = await getDoc(wsRef);

      if (!wsSnap.exists()) {
        setWorkspace(null);
        setLoading(false);
        return;
      }

      const ws = wsSnap.data();

      // 4️⃣ Obtener plan del usuario - CON REAL-TIME UPDATE
      const userRef = doc(db, "users", user.uid);
      
      // Usar onSnapshot para obtener actualizaciones en tiempo real
      const unsubscribe = onSnapshot(userRef, (userSnap) => {
        const userPlan = userSnap.exists() ? (userSnap.data().plan ?? "free") : "free";

        setWorkspace({
          workspaceId,
          name: ws.name,
          color: ws.color ?? "blue",
          role: memberDoc.role,
          plan: userPlan,
        });
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error("useActiveWorkspace error:", err);
      setWorkspace(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, loadWorkspace);
    return () => unsub();
  }, [loadWorkspace]);

  return { workspace, loading };
}
