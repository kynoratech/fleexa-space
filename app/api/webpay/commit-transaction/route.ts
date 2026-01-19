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

    console.log("📊 Respuesta completa de Webpay:", JSON.stringify(response, null, 2));

    // Validar si la transacción fue exitosa
    // response.response_code === 0 significa éxito
    const isSuccessful = response?.response_code === 0;

    console.log(`💳 Resultado del pago - response_code: ${response?.response_code}, isSuccessful: ${isSuccessful}`);

    return NextResponse.json({ 
      ok: true, 
      response,
      isSuccessful,
      status: response?.response_code,
      message: isSuccessful ? "Pago aprobado" : "Pago rechazado",
      responseCode: response?.response_code,
    });

  } catch (err: any) {
    console.error("❌ Error en commit-transaction:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err.message,
      isSuccessful: false
    }, { status: 500 });
  }
}
