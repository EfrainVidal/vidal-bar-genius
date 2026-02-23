"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * AppHeader (Client)
 * We fetch session/pro state from /api/me
 * (Next cookies() is async; easiest reliable method is a lightweight /api/me)
 */

type Me = {
  hasSession: boolean;
  isPro: boolean;
  userId: string | null;
};

function shortId(userId: string) {
  // Email looks nicer if we keep it short in header
  if (userId.includes("@")) {
    const [name, domain] = userId.split("@");
    return `${name.slice(0, 3)}…@${domain}`;
  }
  return userId.length > 16 ? `${userId.slice(0, 8)}…${userId.slice(-4)}` : userId;
}

export default function AppHeader() {
  const [me, setMe] = useState<Me>({ hasSession: false, isPro: false, userId: null });
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json()) as Me;
      setMe(data);
    } catch {
      // keep defaults
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusPill = useMemo(() => {
    if (me.isPro) return <span className="pill pillGood">PRO</span>;
    return <span className="pill pillPro">FREE</span>;
  }, [me.isPro]);

  async function doLogout() {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoading(false);
      // Reload state after logout
      await load();
      // Optional: hard refresh to clear any server-rendered state
      window.location.href = "/";
    }
  }

  return (
    <div style={{ borderBottom: "1px solid rgba(233,236,242,0.10)" }}>
      <div className="container">
        <div className="row rowSpace">
          {/* Left: brand + status */}
          <div className="row">
            <Link href="/" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>
              🍸 Vidal Bar Genius
            </Link>

            {statusPill}

            {me.userId ? (
              <span className="pill">Logged in: {shortId(me.userId)}</span>
            ) : (
              <span className="pill pillWarn">Not logged in</span>
            )}

            {!me.isPro ? (
              <Link className="pill pillPro" href="/pricing">
                Unlock Party Mode
              </Link>
            ) : null}
          </div>

          {/* Right: nav */}
          <div className="row">
            <Link className="v-btn v-btnSmall" href="/make">
              Make Drinks
            </Link>
            <Link className="v-btn v-btnSmall" href="/bar">
              My Bar
            </Link>
            <Link className="v-btn v-btnSmall" href="/my-recipes">
              Saved
            </Link>
            <Link className="v-btn v-btnSmall" href={me.isPro ? "/party" : "/pricing"}>
              Party Mode
            </Link>
            <Link className="v-btn v-btnSmall" href="/pricing">
              Pricing
            </Link>

            {me.userId ? (
              <button className="v-btn v-btnSmall" onClick={doLogout} disabled={loading}>
                {loading ? "…" : "Log out"}
              </button>
            ) : (
              <Link className="v-btn v-btnSmall v-btnPrimary" href="/pricing#login">
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}