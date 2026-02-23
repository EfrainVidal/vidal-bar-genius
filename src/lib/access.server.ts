import "server-only";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth.server";

/**
 * AUTH TRUTH:
 * - Logged in == has valid vbg_session (signed) only.
 * - vbg_uid is anonymous only; never counts as login.
 */
export async function getUserIdOrNull(): Promise<string | null> {
  return await getSessionUserId();
}

export async function getAccess() {
  const userId = await getUserIdOrNull();
  if (!userId) return { userId: null, isPro: false };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  return { userId, isPro: !!user?.isPro };
}