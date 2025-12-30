import { WebpayPlus, Environment } from "transbank-sdk";

export async function POST(req: Request) {
  try {
    const options = {
      commerceCode: "597055555532",
      apiKey: "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
      integrationType: "TEST",
      environment: Environment.Integration, // ← agregado y correcto
    };

    const tx = new WebpayPlus.Transaction(options);

    const buyOrder = "Fleexa_Order_" + Date.now().toString();
    const sessionId = "Fleexa_Session_" + Date.now().toString();
    const amount = 9990;
    const returnUrl = "https://fleexa.space/checkout/retorno";

    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    return Response.json({
      ok: true,
      paymentUrl: response.url + "?token_ws=" + response.token,
      token: response.token,
    });

  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message ?? "Error al crear transacción" },
      { status: 500 }
    );
  }
}
