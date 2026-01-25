"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface ActiveWorkspace {
  workspaceId: string;
  name: string;
  color?: string;
  role: WorkspaceRole;
  plan: "free" | "pro";
}

export function useActiveWorkspace() {
  const searchParams = useSearchParams();
  const wsParam = searchParams.get("ws");

  const [workspace, setWorkspace] = useState<ActiveWorkspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    let unsubscribeAuth: (() => void) | null = null;

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setWorkspace(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1️⃣ memberships
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

        // 2️⃣ workspace activo
        const member =
          membersSnap.docs.find(
            (d) => d.data().workspaceId === wsParam
          )?.data() ?? membersSnap.docs[0].data();

        const workspaceId = member?.workspaceId;

        if (!workspaceId) {
          throw new Error("INVALID_WORKSPACE_ID");
        }

        // 3️⃣ workspace data
        const wsRef = doc(db, "workspaces", workspaceId);
        const wsSnap = await getDoc(wsRef);

        if (!wsSnap.exists()) {
          setWorkspace(null);
          setLoading(false);
          return;
        }

        const ws = wsSnap.data();

        // 4️⃣ user plan (live)
        const userRef = doc(db, "users", user.uid);

        if (unsubscribeUser) unsubscribeUser();

        unsubscribeUser = onSnapshot(userRef, (userSnap) => {
          const plan =
            userSnap.exists() && userSnap.data().plan === "pro"
              ? "pro"
              : "free";

          setWorkspace({
            workspaceId,
            name: ws.name,
            color: ws.color ?? "blue",
            role: member.role,
            plan,
          });

          setLoading(false);
        });
      } catch (err) {
        console.error("useActiveWorkspace error:", err);
        setWorkspace(null);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, [wsParam]);

  return { workspace, loading };
}
