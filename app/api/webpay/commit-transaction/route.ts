import { NextResponse } from "next/server";
import { WebpayPlus, Environment, IntegrationApiKeys } from "transbank-sdk";
import { db } from "@/lib/db";
import { users } from "@/lib/db.schema";
import { eq } from "drizzle-orm";
import { adminDb } from "@/lib/firebaseAdmin"; // 🔥 IMPORTANTE

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token_ws } = await req.json();

    if (!token_ws) {
      return NextResponse.json(
        { ok: false, error: "Falta token_ws" },
        { status: 400 }
      );
    }

    const tx = new WebpayPlus.Transaction({
      commerceCode: "597055555532",
      apiKey: IntegrationApiKeys.WEBPAY,
      environment: Environment.Integration,
    });

    const response = await tx.commit(token_ws);

    console.log("📊 Webpay response:", response);

    const isSuccessful = response?.response_code === 0;

    if (!isSuccessful) {
      return NextResponse.json({
        ok: false,
        isSuccessful: false,
        message: "Pago rechazado",
        responseCode: response?.response_code,
      });
    }

    /**
     * 🔑 EXTRAER firebaseUid DESDE buy_order
     * Formato esperado: Fleexa_<firebaseUid>_<timestamp>
     */
/**
 * 🔑 firebaseUid VIENE DESDE session_id (FUENTE DE VERDAD)
 */
    const firebaseUid: string = response.session_id;

    if (!firebaseUid) {
      throw new Error("FIREBASE_UID_NOT_FOUND_IN_SESSION_ID");
    }


    /**
     * 1️⃣ ACTUALIZAR NEON (FUENTE DE VERDAD)
     */
    const updated = await db
      .update(users)
      .set({
        plan: "pro",
        updatedAt: new Date(),
      })
      .where(eq(users.firebaseUid, firebaseUid))
      .returning();

    if (!updated.length) {
      throw new Error(`Usuario no encontrado en Neon: ${firebaseUid}`);
    }

    console.log("✅ Usuario actualizado a PRO en Neon:", firebaseUid);

    /**
     * 2️⃣ SINCRONIZAR FIRESTORE (PARA EL FRONTEND)
     */
    await adminDb
      .collection("users")
      .doc(firebaseUid)
      .set(
        {
          plan: "pro",
          syncedFrom: "neon",
          syncedAt: new Date(),
        },
        { merge: true }
      );

    console.log("🔥 Firestore sincronizado a PRO:", firebaseUid);

    return NextResponse.json({
      ok: true,
      isSuccessful: true,
      message: "Pago aprobado y plan actualizado a PRO",
    });

  } catch (err: any) {
    console.error("❌ Error en commit-transaction:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
