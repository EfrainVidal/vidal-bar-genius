"use client";

import { useEffect } from "react";

/**
 * SessionBootstrap (fixed):
 * - If logged in (real auth cookie vbg_session exists) => DO NOTHING
 * - If not logged in => ensure anonymous cookie (vbg_uid) exists
 *
 * This prevents the app from confusing "anonymous user" with "logged in user".
 */
export default function SessionBootstrap() {
  useEffect(() => {
    (async () => {
      try {
        // /api/me must reflect REAL login (vbg_session), not vbg_uid
        const res = await fetch("/api/me", { cache: "no-store" });
        const me = await res.json().catch(() => null);

        // If real login exists, do not create/refresh anonymous id
        if (me?.hasSession) return;

        // Otherwise ensure anonymous session exists
        await fetch("/api/session", { method: "POST" }).catch(() => {});
      } catch {
        // ignore
      }
    })();
  }, []);

  return null;
}