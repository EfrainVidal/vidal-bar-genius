"use client";

import { useEffect, useRef, useState } from "react";

export default function LoginBox() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus for better UX (small but powerful)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function isValidEmail(e: string) {
    return /\S+@\S+\.\S+/.test(e);
  }

  async function requestLink() {
    setMsg(null);

    if (!isValidEmail(email)) {
      setMsg("⚠️ Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Failed to send link");
      }

      setMsg("✅ Check your email for your sign-in link (valid for 15 minutes).");

      // Optional: clear input after success
      setEmail("");
    } catch (e: any) {
      setMsg(`⚠️ ${e?.message || "Login failed"}`);
    } finally {
      setLoading(false);
    }
  }

  // Allow pressing Enter to submit (important UX win)
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      requestLink();
    }
  }

  return (
    <div className="panel" id="login">
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>
        Log in to unlock PRO
      </div>

      <p className="subtle" style={{ marginTop: 0 }}>
        Enter your email. We’ll send you a secure login link.
      </p>

      <div className="row" style={{ gap: 10, marginTop: 10 }}>
        <input
          ref={inputRef}
          className="v-input"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
          autoComplete="email"
        />

        <button
          className="v-btn v-btnPrimary"
          onClick={requestLink}
          disabled={loading}
        >
          {loading ? "Sending…" : "Send link"}
        </button>
      </div>

      {msg ? (
        <p className="mini" style={{ marginTop: 10 }}>
          {msg}
        </p>
      ) : null}

      {/* Trust + clarity = higher conversions */}
      <p className="mini" style={{ marginTop: 10 }}>
        🔒 No password needed • works on any device
      </p>

      <p className="mini" style={{ marginTop: 6 }}>
        Tip: check spam/promotions if you don’t see it.
      </p>
    </div>
  );
}