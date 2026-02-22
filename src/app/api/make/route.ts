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
  query: z.string().max(60).optional()
});

export async function POST(req: Request) {
  const { userId, isPro } = await getAccess();
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isPro) {
    const count = await bumpUsage(userId, "make");
    if (count > FREE_LIMITS.makePerDay) {
      return NextResponse.json(
        { error: "DAILY_LIMIT", message: "Free daily limit reached. Upgrade to PRO for more." },
        { status: 402 }
      );
    }
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { userId },
    select: { name: true }
  });

  const names = ingredients.map((i) => i.name);
  const results = matchDrinks(names, parsed.data.query);

  // Free users still get value, but we intentionally restrict the depth:
  // - Free: top 10
  // - Pro: top 40
  const trimmed = isPro ? results.slice(0, 40) : results.slice(0, 10);

  return NextResponse.json({ results: trimmed });
}