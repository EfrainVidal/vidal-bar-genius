// src/app/api/bar/starter/route.ts

import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access.server";
import { prisma } from "@/lib/prisma";
import { STARTER_BAR_PACK } from "@/lib/smartBar";

/**
 * /api/bar/starter
 * Adds a starter bar pack (idempotent-ish).
 * This massively improves activation -> more conversion.
 *
 * IMPORTANT:
 * - Always returns JSON
 * - Never calls Prisma without a real userId
 */

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Non-throwing auth helper (prevents weird non-JSON/HTML responses on auth failures) */
async function getAuthId(): Promise<string | null> {
  try {
    const access = await getAccess();
    const userId = access?.userId;
    if (typeof userId === "string" && userId.trim().length > 0) return userId;
    return null;
  } catch (err) {
    console.error("getAccess() failed in /api/bar/starter:", err);
    return null;
  }
}

/**
 * OPTIONAL DEBUG:
 * Visit /api/bar/starter in the browser to confirm route is live.
 * Remove later if you want.
 */
export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/bar/starter is live" });
}

export async function POST() {
  try {
    const userId = await getAuthId();
    if (!userId) return jsonError("Unauthorized", 401);

    // Load existing ingredient names for this user
    const existing = await prisma.ingredient.findMany({
      where: { userId },
      select: { name: true },
    });

    // Compute what we already have (case-insensitive)
    const have = new Set(existing.map((i) => i.name.toLowerCase()));

    // Only add what's missing (idempotent-ish)
    const toAdd = STARTER_BAR_PACK.filter((x) => !have.has(x.name.toLowerCase()));

    if (toAdd.length === 0) {
      return NextResponse.json({ ok: true, added: 0 });
    }

    // Bulk insert the missing starter pack items
    await prisma.ingredient.createMany({
      data: toAdd.map((x) => ({ userId, name: x.name, type: x.type })),
      // skipDuplicates is optional; only works if you have a unique constraint
      // skipDuplicates: true,
    });

    return NextResponse.json({ ok: true, added: toAdd.length });
  } catch (err) {
    console.error("POST /api/bar/starter error:", err);
    return jsonError("Server error", 500);
  }
}