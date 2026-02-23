import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access.server";

export async function GET() {
  const { userId, isPro } = await getAccess();
  return NextResponse.json({ hasSession: !!userId, userId: userId ?? null, isPro: !!isPro });
}