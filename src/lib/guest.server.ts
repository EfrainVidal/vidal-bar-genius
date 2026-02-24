// src/lib/guest.server.ts

import { cookies } from "next/headers";
import { randomUUID } from "crypto";

/**
 * Guest session cookie
 * - Lets anonymous users save data without login
 * - Works across pages on the same device/browser
 *
 * ✅ Next.js 15: cookies() is ASYNC → must await it
 */

const COOKIE_NAME = "vbg_guest";

/**
 * Returns the guestId if present, otherwise creates one and sets cookie.
 */
export async function getOrCreateGuestId(): Promise<string> {
  const jar = await cookies(); // ✅ FIX: await cookies()

  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing && existing.length > 10) return existing;

  const guestId = randomUUID();

  jar.set(COOKIE_NAME, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return guestId;
}

/**
 * Read guestId if it exists (does NOT create)
 */
export async function getGuestId(): Promise<string | null> {
  const jar = await cookies(); // ✅ FIX

  const v = jar.get(COOKIE_NAME)?.value;
  if (v && v.length > 10) return v;

  return null;
}

/**
 * Clear guest cookie
 */
export async function clearGuestId() {
  const jar = await cookies(); // ✅ FIX

  jar.set(COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
  });
}