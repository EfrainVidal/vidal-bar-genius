import type { Drink } from "@/lib/drinks";

/**
 * Expanded drink library (curated for real-world usage + conversion).
 * Keep names normalized and common.
 *
 * You can keep adding here without touching matching logic.
 */
export const DRINKS_DATA: Drink[] = [
  // --- CORE (from your existing set) ---
  {
    id: "old-fashioned",
    name: "Old Fashioned",
    glass: "Rocks",
    method: "Stir with ice, strain over fresh ice.",
    ingredients: [
      { name: "Bourbon", amount: "2 oz" },
      { name: "Angostura bitters", amount: "2 dashes" },
      { name: "Sugar", amount: "1 tsp (or simple)" },
      { name: "Orange peel", amount: "Garnish" }
    ],
    garnish: "Orange peel",
    tags: ["classic", "whiskey", "stirred"]
  },
  {
    id: "margarita",
    name: "Margarita",
    glass: "Coupe / Rocks",
    method: "Shake with ice, strain. Salt rim optional.",
    ingredients: [
      { name: "Tequila", amount: "2 oz" },
      { name: "Lime juice", amount: "1 oz" },
      { name: "Triple sec", amount: "1 oz" }
    ],
    garnish: "Lime wheel",
    tags: ["citrus", "shaken", "party"]
  },
  {
    id: "moscow-mule",
    name: "Moscow Mule",
    glass: "Copper mug",
    method: "Build over ice. Top with ginger beer.",
    ingredients: [
      { name: "Vodka", amount: "2 oz" },
      { name: "Lime juice", amount: "0.75 oz" },
      { name: "Ginger beer", amount: "Top" }
    ],
    garnish: "Lime wedge",
    tags: ["easy", "refreshing", "party"]
  },
  {
    id: "daiquiri",
    name: "Daiquiri",
    glass: "Coupe",
    method: "Shake with ice, strain.",
    ingredients: [
      { name: "Rum", amount: "2 oz" },
      { name: "Lime juice", amount: "1 oz" },
      { name: "Simple syrup", amount: "0.75 oz" }
    ],
    tags: ["classic", "shaken"]
  },

  // --- HIGH DEMAND PARTY / BAR STAPLES ---
  {
    id: "whiskey-sour",
    name: "Whiskey Sour",
    glass: "Rocks",
    method: "Shake with ice, strain over ice.",
    ingredients: [
      { name: "Bourbon", amount: "2 oz" },
      { name: "Lemon juice", amount: "1 oz" },
      { name: "Simple syrup", amount: "0.75 oz" }
    ],
    tags: ["citrus", "shaken", "classic"]
  },
  {
    id: "tom-collins",
    name: "Tom Collins",
    glass: "Highball",
    method: "Build over ice, top with soda.",
    ingredients: [
      { name: "Gin", amount: "2 oz" },
      { name: "Lemon juice", amount: "1 oz" },
      { name: "Simple syrup", amount: "0.75 oz" },
      { name: "Soda water", amount: "Top" }
    ],
    tags: ["refreshing", "easy"]
  },
  {
    id: "vodka-soda",
    name: "Vodka Soda",
    glass: "Highball",
    method: "Build over ice, top with soda.",
    ingredients: [
      { name: "Vodka", amount: "2 oz" },
      { name: "Soda water", amount: "Top" },
      { name: "Lime", amount: "Wedge" }
    ],
    tags: ["easy", "light", "refreshing"]
  },
  {
    id: "rum-coke",
    name: "Rum & Coke",
    glass: "Highball",
    method: "Build over ice, top with cola.",
    ingredients: [
      { name: "Rum", amount: "2 oz" },
      { name: "Cola", amount: "Top" },
      { name: "Lime", amount: "Wedge" }
    ],
    tags: ["easy", "party"]
  },
  {
    id: "tequila-soda",
    name: "Tequila Soda",
    glass: "Highball",
    method: "Build over ice, top with soda.",
    ingredients: [
      { name: "Tequila", amount: "2 oz" },
      { name: "Soda water", amount: "Top" },
      { name: "Lime", amount: "Wedge" }
    ],
    tags: ["easy", "refreshing"]
  },
  {
    id: "paloma",
    name: "Paloma",
    glass: "Highball",
    method: "Build over ice. Top with grapefruit soda.",
    ingredients: [
      { name: "Tequila", amount: "2 oz" },
      { name: "Lime juice", amount: "0.5 oz" },
      { name: "Grapefruit soda", amount: "Top" }
    ],
    tags: ["refreshing", "easy", "party"]
  },
  {
    id: "gin-tonic",
    name: "Gin & Tonic",
    glass: "Highball",
    method: "Build over ice. Top with tonic.",
    ingredients: [
      { name: "Gin", amount: "2 oz" },
      { name: "Tonic water", amount: "Top" },
      { name: "Lime", amount: "Wedge" }
    ],
    tags: ["easy", "refreshing"]
  },
  {
    id: "negroni",
    name: "Negroni",
    glass: "Rocks",
    method: "Stir with ice, strain over fresh ice.",
    ingredients: [
      { name: "Gin", amount: "1 oz" },
      { name: "Campari", amount: "1 oz" },
      { name: "Sweet vermouth", amount: "1 oz" }
    ],
    garnish: "Orange peel",
    tags: ["classic", "stirred", "bitter"]
  },
  {
    id: "manhattan",
    name: "Manhattan",
    glass: "Coupe",
    method: "Stir with ice, strain.",
    ingredients: [
      { name: "Rye whiskey", amount: "2 oz" },
      { name: "Sweet vermouth", amount: "1 oz" },
      { name: "Angostura bitters", amount: "2 dashes" }
    ],
    garnish: "Cherry",
    tags: ["classic", "stirred", "whiskey"]
  },
  {
    id: "martini",
    name: "Martini",
    glass: "Coupe",
    method: "Stir with ice, strain.",
    ingredients: [
      { name: "Gin", amount: "2.5 oz" },
      { name: "Dry vermouth", amount: "0.5 oz" }
    ],
    garnish: "Olive or lemon twist",
    tags: ["classic", "stirred"]
  },
  {
    id: "vodka-martini",
    name: "Vodka Martini",
    glass: "Coupe",
    method: "Stir with ice, strain.",
    ingredients: [
      { name: "Vodka", amount: "2.5 oz" },
      { name: "Dry vermouth", amount: "0.5 oz" }
    ],
    garnish: "Olive or lemon twist",
    tags: ["classic", "stirred"]
  },
  {
    id: "aperol-spritz",
    name: "Aperol Spritz",
    glass: "Wine glass",
    method: "Build over ice, gentle stir.",
    ingredients: [
      { name: "Aperol", amount: "2 oz" },
      { name: "Prosecco", amount: "3 oz" },
      { name: "Soda water", amount: "1 oz" }
    ],
    tags: ["party", "easy", "refreshing"]
  },
  {
    id: "mojito",
    name: "Mojito",
    glass: "Highball",
    method: "Muddle mint + sugar, add rum + lime, top soda.",
    ingredients: [
      { name: "Rum", amount: "2 oz" },
      { name: "Lime juice", amount: "1 oz" },
      { name: "Mint", amount: "8-10 leaves" },
      { name: "Sugar", amount: "1 tsp (or simple)" },
      { name: "Soda water", amount: "Top" }
    ],
    tags: ["refreshing", "party"]
  },
  {
    id: "cosmopolitan",
    name: "Cosmopolitan",
    glass: "Coupe",
    method: "Shake with ice, strain.",
    ingredients: [
      { name: "Vodka", amount: "1.5 oz" },
      { name: "Triple sec", amount: "1 oz" },
      { name: "Cranberry juice", amount: "1 oz" },
      { name: "Lime juice", amount: "0.5 oz" }
    ],
    tags: ["party", "shaken"]
  },
  {
    id: "lemon-drop",
    name: "Lemon Drop",
    glass: "Coupe",
    method: "Shake with ice, strain (sugar rim optional).",
    ingredients: [
      { name: "Vodka", amount: "2 oz" },
      { name: "Lemon juice", amount: "1 oz" },
      { name: "Simple syrup", amount: "0.75 oz" }
    ],
    tags: ["citrus", "party", "shaken"]
  },
  {
    id: "french-75",
    name: "French 75",
    glass: "Flute",
    method: "Shake gin + lemon + simple, top with champagne.",
    ingredients: [
      { name: "Gin", amount: "1 oz" },
      { name: "Lemon juice", amount: "0.5 oz" },
      { name: "Simple syrup", amount: "0.5 oz" },
      { name: "Champagne", amount: "Top" }
    ],
    tags: ["party", "sparkling"]
  },
  {
    id: "espresso-martini",
    name: "Espresso Martini",
    glass: "Coupe",
    method: "Shake hard with ice, strain.",
    ingredients: [
      { name: "Vodka", amount: "2 oz" },
      { name: "Coffee liqueur", amount: "1 oz" },
      { name: "Espresso", amount: "1 oz" }
    ],
    tags: ["party", "dessert", "shaken"]
  },
  {
    id: "white-russian",
    name: "White Russian",
    glass: "Rocks",
    method: "Build over ice, gentle stir.",
    ingredients: [
      { name: "Vodka", amount: "2 oz" },
      { name: "Coffee liqueur", amount: "1 oz" },
      { name: "Cream", amount: "1 oz" }
    ],
    tags: ["dessert", "easy"]
  },
  {
    id: "black-russian",
    name: "Black Russian",
    glass: "Rocks",
    method: "Build over ice, gentle stir.",
    ingredients: [
      { name: "Vodka", amount: "2 oz" },
      { name: "Coffee liqueur", amount: "1 oz" }
    ],
    tags: ["easy", "dessert"]
  },

  // --- QUICK SHOTS / SIMPLE BUILDS (HIGH USAGE) ---
  {
    id: "tequila-shot-lime-salt",
    name: "Tequila Shot (Salt & Lime)",
    glass: "Shot",
    method: "Serve tequila with salt + lime on the side.",
    ingredients: [
      { name: "Tequila", amount: "1.5 oz" },
      { name: "Salt", amount: "Pinch" },
      { name: "Lime", amount: "Wedge" }
    ],
    tags: ["party", "easy"]
  },
  {
    id: "whiskey-on-rocks",
    name: "Whiskey on the Rocks",
    glass: "Rocks",
    method: "Pour over ice.",
    ingredients: [
      { name: "Whiskey", amount: "2 oz" },
      { name: "Ice", amount: "As needed" }
    ],
    tags: ["easy", "classic"]
  },

  // --- Add more anytime. This list is already much larger than MVP. ---
];