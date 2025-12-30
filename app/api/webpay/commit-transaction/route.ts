import { NextResponse } from "next/server";
import { WebpayPlus, Environment, IntegrationApiKeys } from "transbank-sdk";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token_ws } = await req.json();
    if (!token_ws) {
      return NextResponse.json({ ok: false, error: "Falta token_ws" }, { status: 400 });
    }

    const tx = new WebpayPlus.Transaction({
      commerceCode: "597055555532",
      apiKey: IntegrationApiKeys.WEBPAY,
      environment: Environment.Integration,
    });

    const response = await tx.commit(token_ws);

    return NextResponse.json({ ok: true, response });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
