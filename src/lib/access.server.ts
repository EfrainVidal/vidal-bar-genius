// src/lib/access.server.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth.server";
import { getGuestId } from "@/lib/guest.server";

export async function getUserIdOrNull(): Promise<string | null> {
  return await getSessionUserId();
}

export async function getAccess(): Promise<{
  userId: string | null;
  guestId: string;
  isPro: boolean;
}> {
  // Middleware should guarantee this exists
  const guestId = (await getGuestId()) ?? "missing-guest-cookie";

  const userId = await getUserIdOrNull();

  if (!userId) return { userId: null, guestId, isPro: false };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  return { userId, guestId, isPro: Boolean(user?.isPro) };
}