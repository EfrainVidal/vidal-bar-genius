import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { STARTER_BAR_PACK } from "@/lib/smartBar";

/**
 * POST /api/bar/starter
 * Adds a starter bar pack (idempotent-ish).
 * This massively improves activation -> more conversion.
 */
export async function POST() {
  const { userId } = await getAccess();

  const existing = await prisma.ingredient.findMany({
    where: { userId },
    select: { name: true }
  });

  const have = new Set(existing.map((i) => i.name.toLowerCase()));

  const toAdd = STARTER_BAR_PACK.filter((x) => !have.has(x.name.toLowerCase()));

  if (toAdd.length === 0) {
    return NextResponse.json({ ok: true, added: 0 });
  }

  await prisma.ingredient.createMany({
    data: toAdd.map((x) => ({ userId, name: x.name, type: x.type }))
  });

  return NextResponse.json({ ok: true, added: toAdd.length });
}