/**
 * Vidal Bar Genius — Recipe engine (logic only)
 *
 * Drinks are stored in drinks.data.ts for maintainability.
 */

import { DRINKS_DATA } from "@/lib/drinks.data";

export type Drink = {
  id: string;
  name: string;
  glass: string;
  method: string;
  ingredients: { name: string; amount: string }[];
  garnish?: string;
  tags: string[];
};

// Single source of truth for recipes
export const DRINKS: Drink[] = DRINKS_DATA;

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export type MatchResult = {
  drink: Drink;
  score: number;        // 0..100
  missing: string[];
  matched: string[];
};

export function matchDrinks(userIngredients: string[], query?: string): MatchResult[] {
  const bar = userIngredients.map(normalize);

  const results: MatchResult[] = DRINKS
    .filter((d) => {
      if (!query) return true;
      const q = normalize(query);
      return normalize(d.name).includes(q) || d.tags.some((t) => normalize(t).includes(q));
    })
    .map((drink) => {
      const required = drink.ingredients.map((i) => normalize(i.name));

      const matched: string[] = [];
      const missing: string[] = [];

      for (const req of required) {
        // Loose match: "lime" matches "lime juice", etc.
        const hasIt = bar.some((b) => b.includes(req) || req.includes(b));
        if (hasIt) matched.push(req);
        else missing.push(req);
      }

      const score = Math.round((matched.length / required.length) * 100);
      return { drink, score, missing, matched };
    })
    .sort((a, b) => b.score - a.score || a.missing.length - b.missing.length);

  return results;
}

/**
 * Recommend next ingredients to buy:
 * - Look at the top near-misses and count missing items
 * - Return the top N missing items as "next buys"
 */
export function recommendNextIngredients(results: MatchResult[], n = 3): string[] {
  const counts = new Map<string, number>();

  const candidates = results.filter((r) => r.score >= 60 && r.score < 100);

  for (const r of candidates.slice(0, 12)) {
    for (const m of r.missing) {
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name);
}