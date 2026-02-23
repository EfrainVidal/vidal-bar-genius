import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

const ANON_COOKIE = "vbg_uid";

// If you want anonymous IDs stable even before /api/session runs,
// this ensures there is always an anon id available server-side.
export async function getAnonId(): Promise<string> {
  const jar = await cookies();
  let id = jar.get(ANON_COOKIE)?.value;

  if (!id) {
    id = crypto.randomUUID().slice(0, 16);
    jar.set(ANON_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return id;
}

/**
 * Returns an id for storage/limits:
 * - If logged in: returns email-session userId (vbg_session)
 * - Else: returns anonymous id (vbg_uid)
 */
export async function getUserIdOrAnon(getSessionUserId: () => Promise<string | null>) {
  const userId = await getSessionUserId();
  if (userId) return { userId, isLoggedIn: true };
  const anonId = await getAnonId();
  return { userId: anonId, isLoggedIn: false };
}