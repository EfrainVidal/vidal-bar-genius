"use client";

import { useEffect } from "react";

/**
 * SessionBootstrap:
 * - Calls /api/session to ensure the user cookie exists
 * - Must be client-side so it can hit the route handler
 */
export default function SessionBootstrap() {
  useEffect(() => {
    // Fire-and-forget
    fetch("/api/session", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}