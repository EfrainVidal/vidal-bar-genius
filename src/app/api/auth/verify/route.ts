import { NextResponse } from "next/server";
import { verifyEmailLoginToken } from "@/lib/auth.server";
import { assertEnv } from "@/lib/env.server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";

    await verifyEmailLoginToken(token);

    // Redirect back into app (pricing is fine, or /make)
    const appUrl = assertEnv("APP_URL");
    return NextResponse.redirect(`${appUrl}/pricing?logged_in=1`);
  } catch (e: any) {
    const appUrl = assertEnv("APP_URL");
    const msg = encodeURIComponent(e?.message || "Login failed");
    return NextResponse.redirect(`${appUrl}/pricing?login_error=${msg}`);
  }
}