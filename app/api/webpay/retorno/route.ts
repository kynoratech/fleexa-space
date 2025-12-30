import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token_ws");

  if (!token) {
    return NextResponse.redirect("/?pago=fallido");
  }

  return NextResponse.redirect("/dashboard?token_ws=" + token);
}
