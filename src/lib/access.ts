import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

/**
 * Anonymous session system:
 * - Cookie: vidal_user_id (httpOnly)
 * - If missing, create a new User row + set cookie.
 *
 * Pro entitlement:
 * - DB: User.isPro is source of truth
 * - Cookie: isPro=1 optional convenience (not required)
 */

const COOKIE_USER = "vidal_user_id";
const COOKIE_PRO = "isPro";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 5 // 5 years
  };
}

export async function getOrCreateUserId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_USER)?.value;

  if (existing) {
    // Update lastSeen for lightweight analytics
    await prisma.user.update({
      where: { id: existing },
      data: { lastSeenAt: new Date() }
    }).catch(() => {
      // If the row was deleted, fall through and recreate.
    });

    const stillExists = await prisma.user.findUnique({ where: { id: existing } });
    if (stillExists) return existing;
  }

  // Create a fresh anonymous user
  const id = nanoid(16);

  await prisma.user.create({
    data: { id, lastSeenAt: new Date() }
  });

  jar.set(COOKIE_USER, id, cookieOptions());

  return id;
}

export async function hasAnonSession(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(COOKIE_USER)?.value);
}

/**
 * Returns canonical access for the current request.
 */
export async function getAccess() {
  const userId = await getOrCreateUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const isPro = Boolean(user?.isPro);

  // Optional: set a convenience cookie for UI (not relied on for security)
  const jar = await cookies();
  if (isPro) jar.set(COOKIE_PRO, "1", cookieOptions());
  else jar.delete(COOKIE_PRO);

  return { userId, isPro };
}

export async function getIsPro(): Promise<boolean> {
  const { isPro } = await getAccess();
  return isPro;
}