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
 * GUEST MODE:
 * - Logged-in users store rows under userId
 * - Logged-out users store rows under guestId (cookie)
 *
 * Goals:
 * 1) Always return JSON (no HTML/empty bodies)
 * 2) Never call Prisma without an owner (userId OR guestId)
 * 3) Idempotent-ish: only inserts what the owner doesn't already have
 */

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Owner resolver: uses userId if logged in, otherwise guestId */
type Owner =
  | { kind: "user"; userId: string }
  | { kind: "guest"; guestId: string };

async function getOwner(): Promise<Owner> {
  try {
    const access = await getAccess();

    // Logged in
    if (typeof access.userId === "string" && access.userId.trim().length > 0) {
      return { kind: "user", userId: access.userId };
    }

    // Guest mode (getAccess() guarantees guestId exists)
    if (typeof access.guestId === "string" && access.guestId.trim().length > 0) {
      return { kind: "guest", guestId: access.guestId };
    }

    throw new Error("Missing owner (no userId and no guestId)");
  } catch (err) {
    console.error("getOwner() failed in /api/bar/starter:", err);
    throw err;
  }
}

/**
 * OPTIONAL DEBUG:
 * Visit /api/bar/starter in the browser to confirm route is live.
 * Safe to remove later.
 */
export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/bar/starter is live" });
}

export async function POST() {
  try {
    const owner = await getOwner();

    // ✅ Build a prisma "where" filter based on owner type
    const whereOwner =
      owner.kind === "user" ? { userId: owner.userId } : { guestId: owner.guestId };

    // Load existing ingredient names for this owner
    const existing = await prisma.ingredient.findMany({
      where: whereOwner,
      select: { name: true },
    });

    // Case-insensitive compare
    const have = new Set(existing.map((i) => i.name.toLowerCase()));

    // Only add what's missing (idempotent-ish)
    const toAdd = STARTER_BAR_PACK.filter((x) => !have.has(x.name.toLowerCase()));

    if (toAdd.length === 0) {
      return NextResponse.json({ ok: true, added: 0, owner: owner.kind });
    }

    // Bulk insert starter pack items for this owner
    await prisma.ingredient.createMany({
      data: toAdd.map((x) => ({
        name: x.name,
        type: x.type,

        // ✅ attach ownership
        ...(owner.kind === "user" ? { userId: owner.userId } : { guestId: owner.guestId }),
      })),

      /**
       * If you added @@unique([userId, name, type]) / @@unique([guestId, name, type]),
       * you can enable skipDuplicates for extra safety.
       */
      // skipDuplicates: true,
    });

    return NextResponse.json({ ok: true, added: toAdd.length, owner: owner.kind });
  } catch (err: any) {
    console.error("POST /api/bar/starter error:", err);

    // If unique constraints trigger duplicates, handle gracefully
    const msg =
      typeof err?.code === "string" && err.code === "P2002"
        ? "Starter pack already added."
        : "Server error";

    return jsonError(msg, 500);
  }
}