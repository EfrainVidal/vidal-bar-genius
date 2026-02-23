"use client";

import { useState } from "react";

/**
 * PaywallCard
 * - Calls /api/billing/checkout
 * - Never assumes response is JSON (prevents "Unexpected end of JSON input")
 */
export default function PaywallCard(props: {
  title: string;
  bullets: string[];
  source?: string;
}) {
  const { title, bullets, source } = props;
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: source || "unknown" }),
      });

      // Read as text first so we never crash on invalid/empty JSON
      const text = await res.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data?.error ||
          `Checkout failed (${res.status}). Check Vercel env vars for Stripe + APP_URL.`;
        alert(msg);
        return;
      }

      if (!data?.url || typeof data.url !== "string") {
        alert("Checkout failed: missing redirect URL");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="row rowSpace">
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{title}</div>
          <div className="mini">One-time lifetime upgrade. Instant access.</div>
        </div>

        <button
          className="v-btn v-btnPrimary"
          onClick={startCheckout}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Opening Checkout..." : "Go PRO"}
        </button>
      </div>

      <div className="hr" />

      <div className="kv">
        {bullets.map((b) => (
          <span key={b} className="pill pillPro">
            ✅ {b}
          </span>
        ))}
      </div>

      <div className="hr" />

      <div className="mini">
        If you host people, PRO pays for itself the first time you don’t overbuy.
      </div>
    </div>
  );
}