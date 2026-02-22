import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/access"; // if you removed this, use cookies() here instead
import { DRINKS } from "@/lib/drinks";

/**
 * POST /api/party/plan
 * - Free: returns preview menu only
 * - Pro: returns menu + grouped shopping list based on user's bar
 */

const Schema = z.object({
  guestCount: z.number().int().min(2).max(60),
  vibe: z.enum(["balanced", "classic", "refreshing", "party"])
});

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function pickMenu(vibe: string) {
  // simple curated picks, tuned for conversion (party mode feels "smart")
  const byTag = (tag: string) => DRINKS.filter((d) => d.tags.includes(tag));
  const classic = [...byTag("classic")];
  const refreshing = [...byTag("refreshing")];
  const party = [...byTag("party")];
  const easy = [...byTag("easy")];

  const take = (arr: any[], n: number) => arr.slice(0, n);

  if (vibe === "classic") return take(classic.concat(easy), 6);
  if (vibe === "refreshing") return take(refreshing.concat(easy), 6);
  if (vibe === "party") return take(party.concat(easy), 6);

  // balanced
  return take(classic.concat(refreshing).concat(party).concat(easy), 6);
}

function estimateScale(guestCount: number) {
  // Rough party math: 2.5 drinks per guest baseline
  const drinks = Math.round(guestCount * 2.5);
  const bottles = Math.max(2, Math.round(drinks / 10)); // very rough
  return { drinks, bottles };
}

function groupShopping(items: string[]) {
  const groups: Record<string, string[]> = {
    Spirits: [],
    Mixers: [],
    Citrus: [],
    Pantry: [],
    Other: []
  };

  const spiritHints = ["vodka", "rum", "gin", "tequila", "whiskey", "bourbon", "rye", "vermouth", "campari", "aperol"];
  const mixerHints = ["soda", "tonic", "ginger beer", "cola", "cranberry", "prosecco", "champagne", "grapefruit soda"];
  const citrusHints = ["lime", "lemon"];
  const pantryHints = ["simple syrup", "sugar", "bitters", "mint"];

  for (const item of items) {
    const n = normalize(item);

    if (spiritHints.some((h) => n.includes(h))) groups.Spirits.push(item);
    else if (mixerHints.some((h) => n.includes(h))) groups.Mixers.push(item);
    else if (citrusHints.some((h) => n.includes(h))) groups.Citrus.push(item);
    else if (pantryHints.some((h) => n.includes(h))) groups.Pantry.push(item);
    else groups.Other.push(item);
  }

  return Object.entries(groups)
    .filter(([, list]) => list.length > 0)
    .map(([group, list]) => ({ group, items: Array.from(new Set(list)).sort() }));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const userId = await getUserIdOrNull();

  // If no session yet, return preview (client bootstrap should create session soon)
  if (!userId) {
    const menu = pickMenu(parsed.data.vibe);
    return NextResponse.json({
      preview: true,
      menu,
      scale: estimateScale(parsed.data.guestCount)
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true }
  });

  const isPro = Boolean(user?.isPro);
  const menu = pickMenu(parsed.data.vibe);
  const scale = estimateScale(parsed.data.guestCount);

  // FREE = preview menu only
  if (!isPro) {
    return NextResponse.json({ preview: true, menu, scale });
  }

  // PRO: compute missing items from user's bar inventory
  const bar = await prisma.ingredient.findMany({
    where: { userId },
    select: { name: true }
  });

  const barSet = new Set(bar.map((x) => normalize(x.name)));

  // Collect required ingredients across menu
  const needed = new Set<string>();
  for (const d of menu) {
    for (const ing of d.ingredients) {
      needed.add(ing.name);
    }
  }

  // Missing = not in user's bar (loose match)
  const missing: string[] = [];
  for (const item of needed) {
    const n = normalize(item);
    const has = [...barSet].some((b) => b.includes(n) || n.includes(b));
    if (!has) missing.push(item);
  }

  const shoppingGroups = groupShopping(missing);

  return NextResponse.json({
    preview: false,
    menu,
    scale,
    shoppingGroups
  });
}