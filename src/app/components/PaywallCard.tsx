"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * PaywallCard:
 * - Monetization CTA
 * - Tracks upgrade clicks with source metadata
 *
 * NOTE:
 * - We use a "source" prop to identify where the paywall was triggered.
 */
export default function PaywallCard({
  title = "Unlock PRO",
  bullets,
  source = "unknown"
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

      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e: any) {
      track("upgrade_error", { source, message: e?.message || "unknown" });
      alert(e.message || "Checkout error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="row rowSpace">
        <div>
          <h2 className="pageTitle" style={{ marginBottom: 6 }}>{title} ✨</h2>
          <p className="subtle">One-time lifetime upgrade. Instant access.</p>
        </div>
        <button className="v-btn v-btnPrimary" onClick={goPro} disabled={loading}>
          {loading ? "Opening Checkout…" : "Go PRO"}
        </button>
      </div>

      <div className="hr" />

      <div className="kv">
        {bullets.map((b) => (
          <span className="pill pillPro" key={b}>✅ {b}</span>
        ))}
      </div>

      <p className="mini" style={{ marginTop: 12 }}>
        PRO is how Vidal Bar Genius stays alive. Free stays useful forever.
      </p>
    </div>
  );
}