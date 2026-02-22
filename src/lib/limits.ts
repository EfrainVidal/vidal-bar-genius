import { format } from "date-fns";
import { prisma } from "@/lib/prisma";

/**
 * Free tier limits — tuned for monetization:
 * - Enough value to hook users
 * - Tight enough to create upgrade moments
 */
export const FREE_LIMITS = {
  makePerDay: 12,      // daily recipe match runs
  saveSlots: 8,        // saved recipes
  partyPreview: true,  // can preview party plan but cannot generate exact list or save
  partySave: false
};

export async function bumpUsage(userId: string, keyPrefix: string) {
  const day = format(new Date(), "yyyy-MM-dd");
  const key = `${keyPrefix}:${day}`;

  const row = await prisma.usageEvent.upsert({
    where: { userId_key: { userId, key } },
    update: { count: { increment: 1 } },
    create: { userId, key, count: 1 }
  });

  return row.count;
}

export async function getUsage(userId: string, keyPrefix: string) {
  const day = format(new Date(), "yyyy-MM-dd");
  const key = `${keyPrefix}:${day}`;

  const row = await prisma.usageEvent.findUnique({
    where: { userId_key: { userId, key } }
  });

  return row?.count ?? 0;
}