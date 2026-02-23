// src/lib/access.server.ts

import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Access utilities (SERVER ONLY)
 *
 * - Route Handlers can READ cookies
 * - They CANNOT SET cookies here (do that in /api/session)
 */

export const COOKIE_USER = "vbg_uid";

/**
 * Reads the userId from cookies (or null).
 */
export async function getUserIdOrNull(): Promise<string | null> {
  // ✅ In Next 15, cookies() can be async depending on your setup/types
  const jar = await cookies();
  return jar.get(COOKIE_USER)?.value ?? null;
}

/**
 * Returns whether the current user is PRO.
 */
export async function getIsPro(): Promise<boolean> {
  const userId = await getUserIdOrNull();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  return Boolean(user?.isPro);
}

/**
 * Returns userId + isPro for the current request.
 * NOTE: userId can be null if not logged in.
 */
export async function getAccess(): Promise<{ userId: string | null; isPro: boolean }> {
  const userId = await getUserIdOrNull();
  const isPro = userId ? await getIsPro() : false;
  return { userId, isPro };
}