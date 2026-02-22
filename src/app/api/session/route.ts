import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/session
 * Ensures a userId cookie exists + user row exists.
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
    maxAge: 60 * 60 * 24 * 365 // 1 year
  };
}

export async function POST() {
  const jar = await cookies(); // ✅ IMPORTANT (Next 15.5)

  let id = jar.get(COOKIE_USER)?.value;

  if (!id) {
    id = nanoid(16);
    jar.set(COOKIE_USER, id, cookieOptions());
  }

  // Ensure user exists
  await prisma.user.upsert({
    where: { id },
    update: { lastSeenAt: new Date() },
    create: { id, lastSeenAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}