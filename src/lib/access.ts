import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Access utilities:
 * - Server Components can READ cookies
 * - They CANNOT SET cookies
 *
 * Cookie setting happens in /api/session
 */

export const COOKIE_USER = "vbg_uid";

export async function getUserIdOrNull() {
  const jar = await cookies();
  return jar.get(COOKIE_USER)?.value ?? null;
}

export async function getIsPro() {
  const userId = await getUserIdOrNull();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true }
  });

  return Boolean(user?.isPro);
}

export async function getAccess() {
  const userId = await getUserIdOrNull();
  const isPro = await getIsPro();

  return { userId, isPro };
}