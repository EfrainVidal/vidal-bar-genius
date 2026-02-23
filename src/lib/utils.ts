// src/lib/utils.ts
// CLIENT-SAFE utilities ONLY

/**
 * Clamp a number between min and max
 */
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Safe JSON parse (never throws)
 */
export function safeJsonParse<T>(s: string | null | undefined): T | null {
  if (!s || typeof s !== "string") return null;

  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}