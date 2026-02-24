// src/app/components/ClaimGuestOnLogin.tsx
"use client";

import { useEffect } from "react";

/**
 * Runs ONE TIME after login redirect.
 * - Calls /api/auth/claim-guest to migrate guest data to the logged-in user
 * - Cleans URL param so it doesn't run again on refresh
 */
export default function ClaimGuestOnLogin({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;

    // Fire-and-forget claim. If user isn't actually logged in yet, route returns 401 harmlessly.
    fetch("/api/auth/claim-guest", { method: "POST" }).catch(() => {});

    // Optional: remove logged_in=1 from the URL so it doesn't re-run on refresh
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("logged_in");
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
  }, [active]);

  return null;
}