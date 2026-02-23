import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/session
 * Ensures an anonymous cookie exists (vbg_uid).
 *
 * IMPORTANT:
 * - This is NOT "login"
 * - This should never be used for checkout/PRO
 * - Email auth uses the signed cookie vbg_session instead
 *
 * Next 15.5+: cookies() is async -> MUST await
 */
const COOKIE_USER = "vbg_uid";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  };
}

export async function POST() {
  const jar = await cookies();

  let id = jar.get(COOKIE_USER)?.value;

  // Create cookie only if missing
  if (!id) {
    id = nanoid(16);
    jar.set(COOKIE_USER, id, cookieOptions());
  }

  // Optional: keep anonymous users usable for "free mode" saving
  // (If you don't want anonymous saving, you can REMOVE this upsert entirely.)
  await prisma.user.upsert({
    where: { id },
    update: { lastSeenAt: new Date() },
    create: { id, lastSeenAt: new Date() },
  });

  return NextResponse.json({ ok: true, anonId: id });
}