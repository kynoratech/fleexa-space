"use client";

import { useState } from "react";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";
import { useWorkspaces } from "@/lib/useWorkspaces";
import { useRouter } from "next/navigation";

export default function WorkspaceSwitcher() {
  const { workspace } = useActiveWorkspace();
  const { workspaces } = useWorkspaces();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!workspace) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
      >
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        {workspace.name}
        <span className="text-slate-400">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-56 rounded-xl border border-slate-700 bg-[#0E1629] shadow-xl">
          <div className="p-2 text-xs text-slate-400 border-b border-slate-700">
            Espacios de trabajo
          </div>

          {workspaces.map((ws) => (
            <div
              key={ws.workspaceId}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                ws.workspaceId === workspace.workspaceId
                  ? "font-semibold bg-slate-800 text-indigo-400"
                  : "hover:bg-slate-800 hover:text-white text-slate-300"
              }`}
              onClick={() => {
                if (ws.workspaceId !== workspace.workspaceId) {
                  router.push(`/dashboard?ws=${ws.workspaceId}`);
                  setOpen(false);
                }
              }}
            >
              {ws.name}
            </div>
          ))}

          <div className="border-t border-slate-700 mt-2">
            <button
              className="w-full px-4 py-2 text-left text-sm text-indigo-400 hover:bg-slate-800 hover:text-white transition-colors"
              onClick={() => {
                router.push("/onboarding/workspace");
                setOpen(false);
              }}
            >
              + Crear nuevo espacio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
