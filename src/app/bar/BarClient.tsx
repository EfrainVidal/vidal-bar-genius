"use client";

import { useEffect, useState } from "react";

/**
 * BarClient Props
 * - userId is optional: if null => guest mode
 * - isPro is only true when logged in AND user is pro
 */
type BarClientProps = {
  isPro: boolean;
  userId?: string | null;
};

/**
 * Safe response reader:
 * Prevents crashes like "Unexpected end of JSON input"
 * by reading text first and only parsing JSON when appropriate.
 */
async function readJsonOrText(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  // Empty body: treat as null JSON
  if (!text) return { json: null as any, text: "" };

  // JSON response: parse
  if (contentType.includes("application/json")) {
    try {
      return { json: JSON.parse(text), text };
    } catch {
      // JSON header but invalid JSON body
      return { json: null as any, text };
    }
  }

  // Non-JSON (HTML error page, etc.)
  return { json: null as any, text };
}

/**
 * Throws readable errors instead of crashing
 */
async function assertOk(res: Response) {
  if (res.ok) return;

  const { json, text } = await readJsonOrText(res);

  const msg =
    (json &&
      typeof json === "object" &&
      (json.error || json.message) &&
      String(json.error || json.message)) ||
    (text ? text.slice(0, 200) : "") ||
    `Request failed (${res.status})`;

  throw new Error(msg);
}

/**
 * Main component
 */
export default function BarClient({ isPro, userId }: BarClientProps) {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("spirit");
  const [loading, setLoading] = useState(false);

  /**
   * Load ingredients
   * Guest Mode:
   * - If logged out: server uses guestId cookie and returns guest ingredients
   * - If logged in: server uses userId and returns user ingredients
   */
  async function load() {
    const res = await fetch("/api/bar");
    await assertOk(res);

    const { json } = await readJsonOrText(res);
    setItems(json?.ingredients || []);
  }

  /**
   * Add ingredient
   * Guest Mode:
   * - Works without login (saved to guestId cookie owner)
   */
  async function add() {
    try {
      setLoading(true);

      const res = await fetch("/api/bar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });

      await assertOk(res);

      setName("");
      await load();
    } catch (e: any) {
      alert(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Add starter pack
   * Guest Mode:
   * - Works without login (saved to guestId cookie owner)
   */
  async function addStarterPack() {
    try {
      setLoading(true);

      const res = await fetch("/api/bar/starter", { method: "POST" });
      await assertOk(res);

      const { json } = await readJsonOrText(res);
      const added = typeof json?.added === "number" ? json.added : 0;

      alert(`Starter pack added: ${added} items ✅`);
      await load();
    } catch (e: any) {
      alert(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Remove ingredient
   * Guest Mode:
   * - Deletes only if the ingredient belongs to the current owner (userId or guestId)
   */
  async function remove(id: string) {
    const ok = confirm("Delete this ingredient?");
    if (!ok) return;

    try {
      const res = await fetch("/api/bar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      await assertOk(res);
      await load();
    } catch (e: any) {
      alert(e?.message || "Error");
    }
  }

  /**
   * Load on mount
   */
  useEffect(() => {
    load().catch(() => {});
  }, []);

  const isGuest = !userId;

  return (
    <>
      <h1 className="pageTitle">My Bar 🧊</h1>

      {/* ✅ Guest/Logged-in status messaging (conversion + clarity) */}
      {isGuest ? (
        <p className="subtle">
          You’re in <b>Guest Mode</b> — your bar is saved on this device.{" "}
          <a href="/pricing#login" style={{ fontWeight: 800 }}>
            Log in
          </a>{" "}
          to sync across devices.
        </p>
      ) : (
        <p className="subtle">
          Logged in — your bar is synced across devices.
        </p>
      )}

      <div className="hr" />

      <div className="panel">
        <div className="row" style={{ marginBottom: 10 }}>
          <input
            className="input"
            placeholder='Example: "Tito’s Vodka", "Lime juice", "Ginger beer"...'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="spirit">spirit</option>
            <option value="mixer">mixer</option>
            <option value="garnish">garnish</option>
            <option value="bitters">bitters</option>
            <option value="other">other</option>
          </select>

          <button
            className="v-btn v-btnPrimary"
            onClick={add}
            disabled={loading || name.trim().length < 2}
          >
            {loading ? "Adding…" : "Add"}
          </button>

          <span className={`pill ${isPro ? "pillGood" : ""}`}>
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        <div className="row">
          <button className="v-btn" onClick={addStarterPack} disabled={loading}>
            ⚡ Add Starter Bar Pack
          </button>

          <span className="mini">
            Best for new users: instant matches → instant retention.
          </span>
        </div>

        {/* ✅ Small conversion nudge: guest users should log in eventually */}
        {isGuest ? (
          <div style={{ marginTop: 10 }} className="mini">
            Tip: log in later to keep your bar if you switch phones/laptops.
          </div>
        ) : null}
      </div>

      <div className="hr" />

      <div className="panel">
        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          Your Ingredients ({items.length})
        </div>

        <div className="kv">
          {items.map((it) => (
            <span
              key={it.id}
              className="pill"
              style={{ cursor: "pointer" }}
              onClick={() => remove(it.id)}
            >
              {it.name}{" "}
              <span style={{ opacity: 0.7 }}>
                • {it.type} • delete
              </span>
            </span>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="mini" style={{ marginTop: 10 }}>
            Click <b>Add Starter Bar Pack</b>. You’ll get instant matches and understand the product in 10 seconds.
          </p>
        ) : null}
      </div>
    </>
  );
}