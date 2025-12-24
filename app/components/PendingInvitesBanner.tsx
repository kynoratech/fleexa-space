// app/components/PendingInvitesBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { getPendingInvitesByEmail, acceptInvite } from "@/lib/workspace";
import { useAuth } from "@/lib/useAuth";

export default function PendingInvitesBanner() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    getPendingInvitesByEmail(user.email).then((data) => {
      setInvites(data);
      setLoading(false);
    });
  }, [user]);

  if (loading || invites.length === 0) return null;

  async function handleAccept(invite: any) {
    if (!user) return;

    await acceptInvite({
      inviteId: invite.id,
      workspaceId: invite.workspaceId,
      role: invite.role,
      uid: user.uid,
      invitedBy: invite.invitedBy,
    });

    setInvites((prev) => prev.filter((i) => i.id !== invite.id));
  }

  return (
    <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
      <h2 className="text-sm font-semibold text-sky-300 mb-2">
        Invitaciones pendientes
      </h2>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="text-sm text-slate-200">
              Te invitaron a un equipo
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
  );
}
