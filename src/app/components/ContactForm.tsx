// FILE: src/app/components/ContactForm.tsx
"use client";

import { useMemo, useState } from "react";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

type ContactResponse =
  | { ok: true; ticketId: string; receivedAt: string; emailSent: boolean }
  | { ok: false; error: string };

/**
 * ContactForm (Client Component)
 * - Posts to /api/contact
 * - Shows success/error state
 * - Displays ticket id so users can reference it
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<
    | { type: "success"; text: string; ticketId: string }
    | { type: "error"; text: string }
    | null
  >(null);

  const validation = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    const emailLooksValid =
      trimmedEmail.length >= 6 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!trimmedName) return { ok: false, reason: "Please enter your name." };
    if (!trimmedEmail) return { ok: false, reason: "Please enter your email." };
    if (!emailLooksValid) return { ok: false, reason: "Please enter a valid email address." };
    if (trimmedMessage.length < 10)
      return { ok: false, reason: "Message should be at least 10 characters." };

    return { ok: true, reason: "" };
  }, [name, email, message]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);

    if (!validation.ok) {
      setResult({ type: "error", text: validation.reason });
      return;
    }

    setIsSending(true);
    try {
      const payload: ContactPayload = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ContactResponse;

      if (!res.ok || !json || (json as any).ok !== true) {
        const msg =
          json && (json as any).error
            ? String((json as any).error)
            : "Something went wrong. Please try again.";
        setResult({ type: "error", text: msg });
        return;
      }

      const okJson = json as Extract<ContactResponse, { ok: true }>;

      // If Gmail throttles/fails, we still accept the message and store it in DB.
      // We reflect that gently so the user isn't confused.
      const text = okJson.emailSent
        ? "Message received! We’ll get back to you as soon as we can."
        : "Message received! If you don’t hear back soon, email us directly (SMTP might be temporarily limited).";

      setResult({
        type: "success",
        text,
        ticketId: okJson.ticketId,
      });

      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setResult({
        type: "error",
        text: err instanceof Error ? err.message : "Network error. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel" style={{ marginTop: 12 }}>
      <div className="subtle" style={{ marginBottom: 10 }}>
        Send a message (stored in our database; we also try to email it to support).
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="subtle">Name</span>
          <input
            className="panel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="subtle">Email</span>
          <input
            className="panel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="subtle">Message</span>
          <textarea
            className="panel"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What can we help with?"
            rows={5}
            style={{ resize: "vertical" }}
          />
        </label>

        {result ? (
          <div className="panel" style={{ padding: 10 }} aria-live="polite">
            <span className="pill" style={{ marginRight: 8 }}>
              {result.type === "success" ? "Received" : "Error"}
            </span>

            <span className="subtle">{result.text}</span>

            {result.type === "success" ? (
              <div className="subtle" style={{ marginTop: 6 }}>
                Ticket ID: <span className="pill">{result.ticketId}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="submit"
            className="v-btn"
            disabled={isSending}
            aria-disabled={isSending}
            title={validation.ok ? "Send message" : validation.reason}
          >
            {isSending ? "Sending..." : "Send message"}
          </button>

          {!validation.ok ? <span className="subtle">{validation.reason}</span> : null}
        </div>
      </div>
    </form>
  );
}