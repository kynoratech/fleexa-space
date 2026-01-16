"use client";

import { useState } from "react";
import InviteMemberModal from "./InviteMemberModal";

export default function InviteButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
      >
        + Invitar
      </button>

      <InviteMemberModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
