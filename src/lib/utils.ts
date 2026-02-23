// src/lib/utils.ts
// CLIENT-SAFE utilities ONLY

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function safeJsonParse<T>(s: string | null | undefined): T | null {
  if (!s || typeof s !== "string") return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}