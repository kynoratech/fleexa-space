export const dynamic = "force-dynamic";

import { Suspense } from "react";
import RetornoPagoClient from "./RetornoPagoClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1220]" />}>
      <RetornoPagoClient />
    </Suspense>
  );
}
