"use client";

import { useEffect, useState } from "react";
import { getPendingInvitesByEmail, acceptInvite } from "@/lib/workspace";
import { useAuth } from "@/lib/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PendingInvitesBanner() {
  const auth = useAuth();
  const user = auth.user;

  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.email) return;

    const email = user.email.toLowerCase();

    async function loadInvites() {
      try {
        setLoading(true);

        const data = await getPendingInvitesByEmail(email);

        const enriched = await Promise.all(
          data.map(async (invite: any) => {
            if (invite.workspaceName) return invite;

            try {
              const wsSnap = await getDoc(
                doc(db, "workspaces", invite.workspaceId)
              );

              return {
                ...invite,
                workspaceName: wsSnap.exists()
                  ? wsSnap.data().name
                  : "Sin nombre",
              };
            } catch {
              return {
                ...invite,
                workspaceName: "Sin nombre",
              };
            }
          })
        );

        setInvites(enriched);
      } catch (err) {
        console.error("Error loading invites:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInvites();
  }, [user]);

  if (loading) return null;

  async function handleAccept(invite: any) {
    if (!user) return;

    try {
      await acceptInvite({
        inviteId: invite.id,
        workspaceId: invite.workspaceId,
        role: invite.role ?? "viewer",
        uid: user.uid,
        invitedBy: invite.invitedBy ?? "system",
        invitedEmail: invite.email,
      });

      setInvites((prev) => prev.filter((i) => i.id !== invite.id));

      setSuccess(`Te uniste exitosamente a "${invite.workspaceName}"`);

      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (error: any) {
      console.error("Error aceptando invite:", error);
      alert("No se pudo unir: " + error.message);
    }
  }

  return (
    <>
      {/* ✅ MENSAJE DE ÉXITO */}
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-400">
          ✅ {success}
        </div>
      )}

      {/* 📩 INVITACIONES */}
      {invites.length > 0 && (
        <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
          <h2 className="text-sm font-semibold text-sky-300 mb-2">
            Invitaciones pendientes ({invites.length})
          </h2>

          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="text-sm text-slate-200">
                  Te invitaron al workspace{" "}
                  <span className="font-semibold text-white">
                    {invite.workspaceName ?? "Sin nombre"}
                  </span>
                </div>

                <button
                  onClick={() => handleAccept(invite)}
                  className="rounded-md bg-sky-600 hover:bg-sky-500 transition px-3 py-1.5 text-xs font-medium"
                >
                  Unirme
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
