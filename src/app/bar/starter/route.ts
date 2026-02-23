// src/app/api/bar/starter/route.ts

import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access.server";
import { prisma } from "@/lib/prisma";
import { STARTER_BAR_PACK } from "@/lib/smartBar";

/**
 * POST /api/bar/starter
 * Adds a starter bar pack (idempotent-ish).
 * This massively improves activation -> more conversion.
 */
export async function POST() {
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string before Prisma calls
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;

    const existing = await prisma.ingredient.findMany({
      where: { userId },
      select: { name: true },
    });

    const have = new Set(existing.map((i) => i.name.toLowerCase()));
    const toAdd = STARTER_BAR_PACK.filter((x) => !have.has(x.name.toLowerCase()));

    if (toAdd.length === 0) {
      return NextResponse.json({ ok: true, added: 0 });
    }

    await prisma.ingredient.createMany({
      data: toAdd.map((x) => ({ userId, name: x.name, type: x.type })),
    });

    return NextResponse.json({ ok: true, added: toAdd.length });
  } catch (err) {
    console.error("POST /api/bar/starter error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}