// src/lib/access.ts
// NOTE: This file is intentionally NOT importing next/headers.
// Client components must NEVER import server-only access utilities.

export type Access = { userId: string | null; isPro: boolean };

// If you accidentally import getAccess from "@/lib/access" in a client component,
// it will fail at runtime, which is better than breaking the build.
export function getAccess(): never {
  throw new Error('Do not import getAccess from "@/lib/access". Use "@/lib/access.server" in server code only.');
}