"use client";

import { useEffect, useState } from "react";

/**
 * BarClient:
 * - Add/remove ingredients
 * - Starter Bar Pack (activation booster)
 */
export default function BarClient({ isPro }: { isPro: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("spirit");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/bar");
    const data = await res.json();
    setItems(data.ingredients || []);
  }

  async function add() {
    try {
      setLoading(true);
      const res = await fetch("/api/bar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Add failed");

      setName("");
      await load();
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function addStarterPack() {
    try {
      setLoading(true);
      const res = await fetch("/api/bar/starter", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Starter pack failed");
      alert(`Starter pack added: ${data.added} items ✅`);
      await load();
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    const ok = confirm("Delete this ingredient?");
    if (!ok) return;

    await fetch("/api/bar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    await load();
  }

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

          <select className="select" value={type} onChange={(e) => setType(e.target.value)} style={{ width: 180 }}>
            <option value="spirit">spirit</option>
            <option value="mixer">mixer</option>
            <option value="garnish">garnish</option>
            <option value="bitters">bitters</option>
            <option value="other">other</option>
          </select>

          <button className="v-btn v-btnPrimary" onClick={add} disabled={loading || name.trim().length < 2}>
            {loading ? "Adding…" : "Add"}
          </button>

          <span className={`pill ${isPro ? "pillGood" : ""}`}>{isPro ? "PRO" : "FREE"}</span>
        </div>

        <div className="row">
          <button className="v-btn" onClick={addStarterPack} disabled={loading}>
            ⚡ Add Starter Bar Pack
          </button>
          <span className="mini">Best for new users: instant matches → instant retention.</span>
        </div>
      </div>

      <div className="hr" />

      <div className="panel">
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Your Ingredients ({items.length})</div>

        <div className="kv">
          {items.map((it) => (
            <span key={it.id} className="pill" style={{ cursor: "pointer" }} onClick={() => remove(it.id)}>
              {it.name} <span style={{ opacity: 0.7 }}>• {it.type} • delete</span>
            </span>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="mini" style={{ marginTop: 10 }}>
            Click <b>Add Starter Bar Pack</b>. You’ll get instant matches and you’ll understand the product in 10 seconds.
          </p>
        ) : null}
      </div>
    </>
  );
}