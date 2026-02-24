// src/lib/guest.server.ts
import { cookies } from "next/headers";

export const COOKIE_NAME = "vbg_guest";

/**
 * READ ONLY
 * Middleware creates the guest cookie.
 * This function must never set cookies.
 */
export async function getGuestId(): Promise<string | null> {
  const jar = await cookies();
  const v = jar.get(COOKIE_NAME)?.value;
  return v && v.length > 10 ? v : null;
}

/**
 * Backwards compatible. Still READ ONLY.
 */
export async function getOrCreateGuestId(): Promise<string | null> {
  return await getGuestId();
}

/**
 * CLEAR ONLY (Route Handler / Server Action ONLY)
 */
export async function clearGuestId(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}