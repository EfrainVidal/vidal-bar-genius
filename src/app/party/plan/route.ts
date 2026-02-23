// src/app/api/party/route.ts
// (Keep the filename you already use; just paste this content into that route.)

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { DRINKS, matchDrinks } from "@/lib/drinks";
import { estimateBottles } from "@/lib/smartBar";

/**
 * Party Mode PRO killer endpoint:
 * - Uses user's actual bar to compute exact missing shopping list
 * - Scales quantities by guest count
 * - Free users get preview menu only (no exact shopping + no save)
 */

const Schema = z.object({
  guestCount: z.number().min(2).max(60),
  vibe: z.enum(["balanced", "classic", "refreshing", "party"]),
});

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function groupType(name: string) {
  const n = normalize(name);

  if (["vodka", "rum", "tequila", "gin", "bourbon", "whiskey"].some((k) => n.includes(k))) {
    return "Spirits";
  }

  if (
    [
      "juice",
      "ginger beer",
      "tonic",
      "soda",
      "vermouth",
      "campari",
      "aperol",
      "prosecco",
      "triple sec",
      "liqueur",
      "espresso",
    ].some((k) => n.includes(k))
  ) {
    return "Mixers";
  }

  if (["mint", "orange", "lime", "lemon", "peel"].some((k) => n.includes(k))) {
    return "Garnish & Citrus";
  }

  if (["bitters"].some((k) => n.includes(k))) {
    return "Bitters";
  }

  return "Other";
}

export async function POST(req: Request) {
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string before Prisma calls
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

    const guestCount = parsed.data.guestCount;
    const vibe = parsed.data.vibe;

    // Pull user's bar
    const barRows = await prisma.ingredient.findMany({
      where: { userId },
      select: { name: true },
    });

    const bar = barRows.map((r) => r.name);

    // Choose menu by vibe (deterministic + curated)
    const vibePick =
      vibe === "classic"
        ? ["Old Fashioned", "Daiquiri", "Negroni"]
        : vibe === "refreshing"
        ? ["Moscow Mule", "Mojito", "Paloma"]
        : vibe === "party"
        ? ["Margarita", "Espresso Martini", "Aperol Spritz"]
        : ["Margarita", "Moscow Mule", "Old Fashioned"];

    const menuDrinks = DRINKS.filter((d) => vibePick.includes(d.name));

    // Free: preview only (menu + bottle estimate), no exact missing list
    const scale = estimateBottles(guestCount);

    if (!isPro) {
      return NextResponse.json({
        isPro: false,
        preview: true,
        menu: menuDrinks,
        scale,
      });
    }

    // PRO: exact missing shopping list from user's actual bar
    const missingSet = new Map<string, number>();

    for (const d of menuDrinks) {
      const matches = matchDrinks(bar, d.name);
      const exact = matches.find((m) => m.drink.id === d.id) ?? matches[0];

      // Safety: if matchDrinks returned nothing for some reason, skip gracefully
      if (!exact) continue;

      for (const m of exact.missing) {
        missingSet.set(m, (missingSet.get(m) ?? 0) + 1);
      }
    }

    // Add party essentials that most people forget (always helpful)
    const essentials = ["Ice", "Cups", "Napkins"];
    for (const e of essentials) missingSet.set(e, 1);

    // Group shopping list
    const grouped: Record<string, string[]> = {};
    for (const item of [...missingSet.keys()]) {
      const g = groupType(item);
      grouped[g] = grouped[g] ?? [];
      grouped[g].push(item);
    }

    // Sort groups for clean UX
    const groupOrder = ["Spirits", "Mixers", "Garnish & Citrus", "Bitters", "Other"];
    const shoppingGroups = groupOrder
      .filter((k) => grouped[k]?.length)
      .map((k) => ({ group: k, items: grouped[k].sort() }));

    return NextResponse.json({
      isPro: true,
      preview: false,
      vibe,
      guestCount,
      menu: menuDrinks,
      scale,
      shoppingGroups,
    });
  } catch (err) {
    console.error("POST Party Mode error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}