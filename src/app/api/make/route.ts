// src/app/api/make/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth.server";
import { getUserIdOrAnon } from "@/lib/identity.server";
import { prisma } from "@/lib/prisma";
import { bumpUsage, FREE_LIMITS } from "@/lib/limits";
import { matchDrinks } from "@/lib/drinks";

/**
 * POST /api/make
 * - Works for anonymous users (vbg_uid) and logged-in users (vbg_session)
 * - Enforces free tier daily usage limit
 * - Matches drinks based on user's bar ingredients
 *
 * Auth rules:
 * - Logged in == valid vbg_session (email magic link)
 * - Anonymous == vbg_uid (created by /api/session or identity helper)
 * - PRO only exists for logged-in email users (anonymous is always free)
 */
const Schema = z.object({
  query: z.string().max(60).optional(),
});

export async function POST(req: Request) {
  try {
    // ✅ Get identity: logged-in userId OR anonymous id
    const { userId, isLoggedIn } = await getUserIdOrAnon(getSessionUserId);

    // Ensure the User row exists (safe for both anon + logged-in)
    // This makes ingredient queries and usage tracking always work.
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { lastSeenAt: new Date() },
      create: { id: userId, lastSeenAt: new Date() },
      select: { isPro: true },
    });

    // ✅ PRO only counts for logged-in users
    const isPro = isLoggedIn && !!user.isPro;

    // Parse body safely
    const body = await req.json().catch(() => null);
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Free tier limit (anonymous + free logged-in users)
    if (!isPro) {
      const count = await bumpUsage(userId, "make");
      if (count > FREE_LIMITS.makePerDay) {
        return NextResponse.json(
          { error: "DAILY_LIMIT", message: "Free daily limit reached. Upgrade to PRO for more." },
          { status: 402 }
        );
      }
    }

    // Load bar ingredients for this identity (anon or logged-in)
    const ingredients = await prisma.ingredient.findMany({
      where: { userId },
      select: { name: true },
    });

    const names = ingredients.map((i) => i.name);

    // Match drinks based on user's bar + optional query
    const results = matchDrinks(names, parsed.data.query);

    // Depth rules:
    // - Free: top 10
    // - Pro: top 40
    const trimmed = isPro ? results.slice(0, 40) : results.slice(0, 10);

    return NextResponse.json({
      results: trimmed,
      // Optional debugging flags (harmless; you can remove later)
      meta: {
        isLoggedIn,
        isPro,
      },
    });
  } catch (err) {
    console.error("POST /api/make error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}