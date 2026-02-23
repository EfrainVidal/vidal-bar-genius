import { NextResponse } from "next/server";
import { logout } from "@/lib/auth.server";
import { assertEnv } from "@/lib/env.server";

export async function POST() {
  await logout();
  const appUrl = assertEnv("APP_URL");
  return NextResponse.json({ ok: true, redirect: `${appUrl}/` });
}