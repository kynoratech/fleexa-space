"use client";

import { WebpayPlus } from "transbank-sdk";

export async function POST(req: Request) {
  try {
    const { token_ws } = await req.json();
    if (!token_ws) {
      return Response.json({ ok: false, error: "Falta token_ws" }, { status: 400 });
    }

    const tx = new WebpayPlus.Transaction({
      commerceCode: "597055555532",
      apiKey: "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
      environment: "TEST",
    });

    const response = await tx.commit(token_ws);

    return Response.json({ ok: true, response });

  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message ?? "Error al confirmar pago" },
      { status: 500 }
    );
  }
}
