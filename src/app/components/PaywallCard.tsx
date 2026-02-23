"use client";

import { useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * PaywallCard:
 * - Monetization CTA
 * - Tracks upgrade clicks with source metadata
 *
 * Safety:
 * - Never assume JSON
 * - Read as text first, then parse safely
 * - Prevent double-click / duplicate checkout sessions
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
  const [error, setError] = useState<string | null>(null);

  // Hard lock to prevent double-click before React state updates
  const inFlightRef = useRef(false);

  function safeTrack(event: string, props?: Record<string, any>) {
    try {
      track(event, props);
    } catch {
      // Never block purchase flow on analytics
    }
  }

  function extractErrorMessage(res: Response, data: any, rawText: string) {
    // Prefer structured server errors if present
    const base =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `Checkout failed (${res.status})`;

    const detail =
      data && typeof data === "object" && data.detail ? String(data.detail) : "";

    // If server returned non-JSON (HTML, empty, etc.), include a tiny hint
    // without dumping the whole body (keeps alerts clean).
    const hint =
      !data && rawText
        ? rawText.slice(0, 120).replace(/\s+/g, " ").trim()
        : "";

    if (detail) return `${base}: ${detail}`;
    if (hint) return `${base}. Server response: "${hint}${rawText.length > 120 ? "…" : ""}"`;
    return String(base);
  }

  async function goPro() {
  if (inFlightRef.current) return;

  setError(null);
  inFlightRef.current = true;
  setLoading(true);

  safeTrack("upgrade_clicked", { source });

  try {
    // ✅ Unique per attempt — prevents double charges and allows retry after cancel
    const nonce =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, nonce }),
    });

    const rawText = await res.text();

    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg = extractErrorMessage(res, data, rawText);
      throw new Error(msg);
    }

    const url = data?.url;
    if (!url || typeof url !== "string") {
      throw new Error("Checkout failed: missing redirect URL from server.");
    }

    window.location.assign(url);
  } catch (e: any) {
    const msg = e?.message || "Checkout error";
    safeTrack("upgrade_error", { source, message: msg });
    setError(msg);
    alert(msg);
  } finally {
    setLoading(false);
    inFlightRef.current = false;
  }
}

  return (
    <div className="panel" aria-busy={loading}>
      <div className="row rowSpace">
        <div>
          <h2 className="pageTitle" style={{ marginBottom: 6 }}>
            {title} ✨
          </h2>
          <p className="subtle" style={{ marginTop: 0 }}>
            One-time lifetime upgrade. Instant access.
          </p>

          {/* Tiny trust line */}
          <p className="mini" style={{ marginTop: 8 }}>
            🔒 Secure checkout via Stripe
          </p>
        </div>

        <button
          className="v-btn v-btnPrimary"
          onClick={goPro}
          disabled={loading}
          aria-disabled={loading}
        >
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

      {error ? (
        <div style={{ marginTop: 12 }} className="mini">
          <span className="pill pillWarn">⚠️ {error}</span>
        </div>
      ) : null}

      <p className="mini" style={{ marginTop: 12 }}>
        PRO is how Vidal Bar Genius stays alive. Free stays useful forever.
      </p>
    </div>
  );
}