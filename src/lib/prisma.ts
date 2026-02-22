import { PrismaClient } from "@prisma/client";

/**
 * Fix:
 * - DO NOT set engineType here
 * - Let Prisma use default (binary)
 * - Prevent multiple instances in dev
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // optional logging
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}