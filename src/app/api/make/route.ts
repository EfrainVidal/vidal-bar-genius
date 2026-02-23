// src/app/api/make/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { bumpUsage, FREE_LIMITS } from "@/lib/limits";
import { matchDrinks } from "@/lib/drinks";

/**
 * POST /api/make
 * - Enforces free tier daily usage limit
 * - Matches drinks based on user's bar ingredients
 * - Returns results
 */
const Schema = z.object({
  query: z.string().max(60).optional(),
});

export async function POST(req: Request) {
  try {
    // getAccess() returns userId: string | null (or possibly undefined)
    const access = await getAccess();

    // Reject anonymous requests and guarantee userId is a string for Prisma + bumpUsage
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;
    const isPro: boolean = !!access.isPro;

    const body = await req.json().catch(() => null);
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Free tier limit
    if (!isPro) {
      const count = await bumpUsage(userId, "make"); // ✅ userId is guaranteed string
      if (count > FREE_LIMITS.makePerDay) {
        return NextResponse.json(
          { error: "DAILY_LIMIT", message: "Free daily limit reached. Upgrade to PRO for more." },
          { status: 402 }
        );
      }
    }

    const ingredients = await prisma.ingredient.findMany({
      where: { userId }, // ✅ userId is guaranteed string
      select: { name: true },
    });

    const names = ingredients.map((i) => i.name);
    const results = matchDrinks(names, parsed.data.query);

    // Free users still get value, but we intentionally restrict the depth:
    // - Free: top 10
    // - Pro: top 40
    const trimmed = isPro ? results.slice(0, 40) : results.slice(0, 10);

    return NextResponse.json({ results: trimmed });
  } catch (err) {
    console.error("POST /api/make error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}