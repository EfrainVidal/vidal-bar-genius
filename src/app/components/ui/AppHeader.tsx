"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * AppHeader (Client)
 * - Next 15 cookies() cannot be read sync in Server Components
 * - So we fetch session/pro state from /api/me
 */

type Me = {
  hasSession: boolean;
  isPro: boolean;
  userId: string | null;
};

export default function AppHeader() {
  const [me, setMe] = useState<Me>({ hasSession: false, isPro: false, userId: null });

  async function load() {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as Me;
      setMe(data);
    } catch {
      // If this fails, keep defaults (free + no session)
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ borderBottom: "1px solid rgba(233,236,242,0.10)" }}>
      <div className="container">
        <div className="row rowSpace">
          <div className="row">
            <Link href="/" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>
              🍸 Vidal Bar Genius
            </Link>

            {!me.isPro ? (
              <span className="pill pillPro">PRO • Unlock Party Mode</span>
            ) : (
              <span className="pill pillGood">PRO ACTIVE</span>
            )}

            {me.hasSession ? <span className="pill">Session ✓</span> : <span className="pill">No session</span>}
          </div>

          <div className="row">
            <Link className="v-btn v-btnSmall" href="/make">Make Drinks</Link>
            <Link className="v-btn v-btnSmall" href="/bar">My Bar</Link>
            <Link className="v-btn v-btnSmall" href="/my-recipes">Saved</Link>
            <Link className="v-btn v-btnSmall" href="/party">Party Mode</Link>
            <Link className="v-btn v-btnSmall" href="/pricing">Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}