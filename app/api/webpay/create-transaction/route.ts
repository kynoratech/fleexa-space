import { WebpayPlus, Environment } from "transbank-sdk";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { billingCycle, firebaseUid } = await req.json();

    if (!billingCycle || !firebaseUid) {
      return Response.json(
        { ok: false, error: "Faltan datos" },
        { status: 400 }
      );
    }

    const amount = billingCycle === "yearly" ? 99900 : 9990;

    const tx = new WebpayPlus.Transaction({
      commerceCode: "597055555532",
      apiKey: "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
      environment: Environment.Integration,
    });

    const buyOrder = `FX${Date.now()}`; // <= 26 chars
    const sessionId = firebaseUid;      // 🔥 identidad real


    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const returnUrl = `${protocol}://${host}/checkout/retorno`;

    const response = await tx.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    return Response.json({
      ok: true,
      paymentUrl: `${response.url}?token_ws=${response.token}`,
      token: response.token,
    });

  } catch (err: any) {
    console.error("❌ Error create-transaction:", err);
    return Response.json(
      { ok: false, error: err.message ?? "Error al crear transacción" },
      { status: 500 }
    );
  }
}
