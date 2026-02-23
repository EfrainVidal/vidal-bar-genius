"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * PaywallCard:
 * - Monetization CTA
 * - Tracks upgrade clicks with source metadata
 *
 * Fix:
 * - Never assume the response is valid JSON.
 * - Read as text first, then parse safely.
 * - Send { source } to backend so you can attribute conversions.
 */
export default function PaywallCard({
  title = "Unlock PRO",
  bullets,
  source = "unknown",
}: {
  title?: string;
  bullets: string[];
  source?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function goPro() {
    try {
      setLoading(true);

      // Track intent before redirect
      track("upgrade_clicked", { source });

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });

      // IMPORTANT: read as text first so we never crash on invalid/empty JSON
      const text = await res.text();

      // Try to parse JSON, but never throw if it's not JSON
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        // Prefer server error message if provided
        const msg =
          data?.error ||
          `Checkout failed (${res.status}). Check Vercel env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_ID_PRO, APP_URL.`;
        throw new Error(msg);
      }

      if (!data?.url || typeof data.url !== "string") {
        throw new Error("Checkout failed: missing redirect URL from server.");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      track("upgrade_error", { source, message: e?.message || "unknown" });
      alert(e?.message || "Checkout error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="row rowSpace">
        <div>
          <h2 className="pageTitle" style={{ marginBottom: 6 }}>
            {title} ✨
          </h2>
          <p className="subtle">One-time lifetime upgrade. Instant access.</p>
        </div>

        <button className="v-btn v-btnPrimary" onClick={goPro} disabled={loading}>
          {loading ? "Opening Checkout…" : "Go PRO"}
        </button>
      </div>

      <div className="hr" />

      <div className="kv">
        {bullets.map((b) => (
          <span className="pill pillPro" key={b}>
            ✅ {b}
          </span>
        ))}
      </div>

      <p className="mini" style={{ marginTop: 12 }}>
        PRO is how Vidal Bar Genius stays alive. Free stays useful forever.
      </p>
    </div>
  );
}