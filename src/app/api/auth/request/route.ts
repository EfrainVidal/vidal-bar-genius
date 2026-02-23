import { NextResponse } from "next/server";
import { startEmailLogin } from "@/lib/auth.server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;
    if (typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    await startEmailLogin(email);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Login request failed", detail: e?.message || "Unknown error" },
      { status: 400 }
    );
  }
}