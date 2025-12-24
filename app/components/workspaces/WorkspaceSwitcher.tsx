"use client";

import { useState } from "react";
import { useActiveWorkspace } from "@/lib/useActiveWorkspace";
import { useWorkspaces } from "@/lib/useWorkspaces";

export default function WorkspaceSwitcher() {
  const { workspace } = useActiveWorkspace();
  const { workspaces } = useWorkspaces();
  const [open, setOpen] = useState(false);

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
        <div className="absolute z-50 mt-2 w-56 rounded-xl border bg-white shadow-lg">
          <div className="p-2 text-xs text-slate-500">
            Espacios de trabajo
          </div>

          {workspaces.map((ws) => (
            <div
              key={ws.workspaceId}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 ${
                ws.workspaceId === workspace.workspaceId
                  ? "font-semibold bg-slate-50"
                  : ""
              }`}
            >
              {ws.name}
            </div>
          ))}

          <div className="border-t mt-2">
            <button className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-slate-50">
              + Crear nuevo espacio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
