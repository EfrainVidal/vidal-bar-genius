/**
 * Smart Bar utilities:
 * - Starter bar pack for instant activation
 * - Party scaling helpers (rough but believable)
 */

export const STARTER_BAR_PACK: { name: string; type: string }[] = [
  { name: "Vodka", type: "spirit" },
  { name: "Rum", type: "spirit" },
  { name: "Tequila", type: "spirit" },
  { name: "Gin", type: "spirit" },
  { name: "Bourbon", type: "spirit" },

  { name: "Lime juice", type: "mixer" },
  { name: "Lemon juice", type: "mixer" },
  { name: "Simple syrup", type: "mixer" },
  { name: "Ginger beer", type: "mixer" },
  { name: "Tonic water", type: "mixer" },
  { name: "Soda water", type: "mixer" },
  { name: "Triple sec", type: "mixer" },

  { name: "Angostura bitters", type: "bitters" },
  { name: "Mint", type: "garnish" },
  { name: "Orange peel", type: "garnish" }
];

/**
 * Simple party scaling:
 * - Assume 2 drinks per guest for a normal party
 * - Average drink uses 2 oz spirit (for spirit-forward drinks)
 * - Convert to bottle estimates (750ml ~ 25.36 oz)
 */
export function estimateBottles(guestCount: number) {
  const drinks = Math.max(guestCount * 2, 6);
  const spiritOz = drinks * 2; // 2 oz per drink rough
  const bottles = Math.ceil(spiritOz / 25.36);
  return { drinks, bottles };
}