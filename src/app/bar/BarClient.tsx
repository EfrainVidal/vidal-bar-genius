"use client";

import { useEffect, useState } from "react";

/**
 * Props definition (IMPORTANT)
 * This fixes your TypeScript error about userId not existing
 */
type BarClientProps = {
  isPro: boolean;
  userId?: string | null;
};

/**
 * Safe response reader:
 * Prevents crashes like "Unexpected end of JSON input"
 */
async function readJsonOrText(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text) return { json: null as any, text: "" };

  if (contentType.includes("application/json")) {
    try {
      return { json: JSON.parse(text), text };
    } catch {
      return { json: null as any, text };
    }
  }

  return { json: null as any, text };
}

/**
 * Throws readable errors instead of crashing
 */
async function assertOk(res: Response) {
  if (res.ok) return;

  const { json, text } = await readJsonOrText(res);

  const msg =
    (json && typeof json === "object" && (json.error || json.message) && String(json.error || json.message)) ||
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
   */
  async function load() {
    const res = await fetch("/api/bar");
    await assertOk(res);

    const { json } = await readJsonOrText(res);
    setItems(json?.ingredients || []);
  }

  /**
   * Add ingredient
   */
  async function add() {
    try {
      setLoading(true);

      // ❌ Prevent adding if not logged in
      if (!userId) {
        alert("Please log in first.");
        window.location.href = "/pricing#login";
        return;
      }

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
   */
  async function addStarterPack() {
    try {
      setLoading(true);

      // ❌ Prevent unauthorized call (fixes your current error)
      if (!userId) {
        alert("Please log in first.");
        window.location.href = "/pricing#login";
        return;
      }

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

  return (
    <>
      <h1 className="pageTitle">My Bar 🧊</h1>
      <p className="subtle">
        Add what you have. Better bar = better matches = more “holy sh*t” moments.
      </p>

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
            disabled={loading || name.trim().length < 2 || !userId}
          >
            {loading ? "Adding…" : "Add"}
          </button>

          <span className={`pill ${isPro ? "pillGood" : ""}`}>
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        <div className="row">
          <button
            className="v-btn"
            onClick={addStarterPack}
            disabled={loading || !userId} // ✅ disable if not logged in
            title={!userId ? "Login required" : undefined}
          >
            ⚡ Add Starter Bar Pack
          </button>

          {!userId ? (
            <span className="mini">Login required to save your bar.</span>
          ) : (
            <span className="mini">
              Best for new users: instant matches → instant retention.
            </span>
          )}
        </div>
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