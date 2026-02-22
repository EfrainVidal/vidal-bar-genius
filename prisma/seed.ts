import { PrismaClient } from "@prisma/client";

/**
 * Seed only adds a single demo "global" idea:
 * We don't create a user here (users are cookie-created).
 * This file exists so "db:seed" is valid and future-proof.
 */
const prisma = new PrismaClient();

async function main() {
  console.log("Seed: nothing to seed yet (users are created via cookies).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });