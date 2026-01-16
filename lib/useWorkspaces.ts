"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export interface WorkspaceItem {
  workspaceId: string;
  name: string;
  role: "owner" | "admin" | "editor" | "viewer";
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "workspaceMembers"),
          where("userId", "==", user.uid)
        );

        const snap = await getDocs(q);
        const results: WorkspaceItem[] = [];

        for (const docSnap of snap.docs) {
          const member = docSnap.data();
          const wsRef = doc(db, "workspaces", member.workspaceId);
          const wsSnap = await getDoc(wsRef);

          if (wsSnap.exists()) {
            results.push({
              workspaceId: member.workspaceId,
              name: wsSnap.data().name,
              role: member.role,
            });
          }
        }

        setWorkspaces(results);
      } catch (err) {
        console.error("useWorkspaces error", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { workspaces, loading };
}
