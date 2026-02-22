import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/me
 * Returns session + entitlement.
 *
 * Next 15.5+: cookies() is async -> MUST await
 */
const COOKIE_USER = "vbg_uid";

export async function GET() {
  const jar = await cookies(); // ✅ IMPORTANT (Next 15.5)
  const userId = jar.get(COOKIE_USER)?.value ?? null;

  if (!userId) {
    return NextResponse.json({ hasSession: false, isPro: false, userId: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true }
  });

  return NextResponse.json({
    hasSession: true,
    isPro: Boolean(user?.isPro),
    userId
  });
}