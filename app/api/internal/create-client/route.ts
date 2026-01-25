import { NextResponse } from "next/server";
import { createClientServer } from "@/actions/createClient";
import { createWorkspaceClientInFirestore } from "@/actions/firestoreOperations";

export async function POST(req: Request) {
  try {
    const {
      firebaseUid,
      workspace,
      nombre,
      email,
      phone,
    } = await req.json();

    const newClient = await createClientServer({
      firebaseUid,
      workspace,
      nombre,
      email,
      phone,
    });

    await createWorkspaceClientInFirestore(
      workspace.id,
      firebaseUid,
      nombre,
      email,
      phone,
      newClient.id
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("CREATE CLIENT ERROR", err);
    return NextResponse.json(
      { ok: false, error: err.message || "CREATE_CLIENT_FAILED" },
      { status: 500 }
    );
  }
}
