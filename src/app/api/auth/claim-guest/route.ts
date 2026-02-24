// src/app/api/auth/claim-guest/route.ts

import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access.server";
import { getGuestId, clearGuestId } from "@/lib/guest.server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/claim-guest
 *
 * Purpose:
 * - User logs in (has real userId)
 * - We migrate any guest-owned data (guestId cookie) to that user
 *
 * Notes:
 * - Always returns JSON
 * - Handles duplicates safely (won't crash if user already has some items)
 * - ✅ Next.js 15 cookies(): guest helpers are async, so we must await them
 */
export async function POST() {
  try {
    // ✅ Must be logged in to claim
    const access = await getAccess().catch(() => null);
    const userId = access?.userId;

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Must have guest cookie to claim from (NOW ASYNC)
    const guestId = await getGuestId();
    if (!guestId) {
      return NextResponse.json({ ok: true, claimed: 0 });
    }

    /**
     * Avoid unique conflicts.
     * If you added @@unique([userId, name, type]) and the user already has an ingredient
     * that matches a guest ingredient, moving rows can fail.
     *
     * So we:
     * 1) Load guest ingredients
     * 2) Load user ingredients
     * 3) Delete guest duplicates that the user already has
     * 4) Move remaining guest rows to the user
     */

    const guestIngredients = await prisma.ingredient.findMany({
      where: { guestId },
      select: { id: true, name: true, type: true },
    });

    // Nothing to claim: clear cookie and exit (NOW ASYNC)
    if (guestIngredients.length === 0) {
      await clearGuestId();
      return NextResponse.json({ ok: true, claimed: 0 });
    }

    const userIngredients = await prisma.ingredient.findMany({
      where: { userId },
      select: { name: true, type: true },
    });

    const userHave = new Set(
      userIngredients.map((i) => `${i.name.toLowerCase()}::${i.type.toLowerCase()}`)
    );

    // Identify guest rows that would conflict with existing user rows
    const duplicates = guestIngredients
      .filter((g) => userHave.has(`${g.name.toLowerCase()}::${g.type.toLowerCase()}`))
      .map((g) => g.id);

    if (duplicates.length > 0) {
      // Delete conflicting guest rows so the move doesn't violate unique constraints
      await prisma.ingredient.deleteMany({
        where: { id: { in: duplicates }, guestId },
      });
    }

    // Move remaining guest rows to user
    const moved = await prisma.ingredient.updateMany({
      where: { guestId },
      data: { userId, guestId: null },
    });

    // ✅ Once claimed, clear guest cookie (NOW ASYNC)
    await clearGuestId();

    return NextResponse.json({
      ok: true,
      claimed: moved.count,
      removedDuplicates: duplicates.length,
    });
  } catch (err) {
    console.error("POST /api/auth/claim-guest error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}