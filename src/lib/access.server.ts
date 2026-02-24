// src/lib/access.server.ts

import "server-only";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth.server";
import { getOrCreateGuestId } from "@/lib/guest.server";

/**
 * AUTH TRUTH:
 * - Logged in == has valid vbg_session (signed) only.
 * - Guest == has vbg_guest cookie (anonymous session).
 *
 * ACCESS CONTRACT:
 * - guestId is ALWAYS present (used for anonymous saving)
 * - userId is null when logged out
 * - isPro is true only when logged-in user has isPro in DB
 */

export async function getUserIdOrNull(): Promise<string | null> {
  // ✅ Only real login comes from signed session cookie
  return await getSessionUserId();
}

export async function getAccess(): Promise<{
  userId: string | null;
  guestId: string;
  isPro: boolean;
}> {
  // ✅ Always ensure a guestId exists (anonymous experience works immediately)
  const guestId = await getOrCreateGuestId();

  // ✅ userId exists only if logged in
  const userId = await getUserIdOrNull();

  // Logged out: still return guestId so the app can save to guest
  if (!userId) {
    return { userId: null, guestId, isPro: false };
  }

  // Logged in: read PRO status from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  // ✅ If user row missing for some reason, treat as non-pro (but still logged in)
  const isPro = Boolean(user?.isPro);

  return {
    userId,
    guestId,
    isPro,
  };
}