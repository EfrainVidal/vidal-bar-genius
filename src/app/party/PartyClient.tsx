"use client";

import { useEffect, useMemo, useState } from "react";
import PaywallCard from "@/app/components/PaywallCard";
import { track } from "@/lib/analytics";

/**
 * Party Mode — finished + analytics
 */
export default function PartyClient({ isPro }: { isPro: boolean }) {
  const [guestCount, setGuestCount] = useState(8);
  const [vibe, setVibe] = useState<"balanced" | "classic" | "refreshing" | "party">("balanced");

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [title, setTitle] = useState("My Party Plan");

  const headline = useMemo(() => (isPro ? "Party Mode 🍸" : "Party Mode (PRO) 🍸"), [isPro]);

  async function generate() {
    try {
      setLoading(true);

      track("party_generate_clicked", { isPro, guestCount, vibe });

      const res = await fetch("/api/party/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestCount, vibe })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Plan failed");

      setPlan(data);
      setTitle(`Party • ${guestCount} guests • ${vibe}`);

      track("party_generated", {
        isPro,
        preview: Boolean(data?.preview),
        menuCount: (data?.menu || []).length
      });
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function loadSavedPlans() {
    if (!isPro) return;
    const res = await fetch("/api/party/plans");
    const data = await res.json();
    setPlans(data.plans || []);
  }

  async function savePlan() {
    if (!plan || !isPro) return;

    track("party_save_attempt", { isPro, guestCount, vibe });

    const res = await fetch("/api/party/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        guestCount,
        vibe,
        planJson: JSON.stringify(plan)
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.message || "Save failed");
      return;
    }

    track("party_saved", { isPro, guestCount, vibe });
    alert("Plan saved ✅");
    await loadSavedPlans();
  }

  async function deletePlan(id: string) {
    const ok = confirm("Delete this saved plan?");
    if (!ok) return;

    track("party_delete_plan", { isPro });

    await fetch("/api/party/plans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    await loadSavedPlans();
  }

  useEffect(() => {
    track("page_view", { page: "party", isPro });
    generate().catch(() => {});
    loadSavedPlans().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className="pageTitle">{headline}</h1>
      <p className="subtle">
        Build a menu + shopping plan. PRO computes exact missing items from your bar and lets you save plans.
      </p>

      <div className="hr" />

      {!isPro ? (
        <PaywallCard
          source="party_top"
          title="Unlock Party Mode (exact shopping list)"
          bullets={[
            "Exact missing items based on your bar",
            "Guest scaling (believable quantities)",
            "Save plans for future parties"
          ]}
        />
      ) : null}

      <div className="hr" />

      <div className="panel">
        <div className="row" style={{ marginBottom: 10 }}>
          <label className="badge">Guests</label>
          <input
            className="input"
            type="number"
            min={2}
            max={60}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            style={{ width: 120 }}
          />

          <label className="badge">Vibe</label>
          <select
            className="select"
            value={vibe}
            onChange={(e) => setVibe(e.target.value as any)}
            style={{ width: 220 }}
          >
            <option value="balanced">balanced</option>
            <option value="classic">classic</option>
            <option value="refreshing">refreshing</option>
            <option value="party">party</option>
          </select>

          <button className="v-btn v-btnPrimary" onClick={generate} disabled={loading}>
            {loading ? "Generating…" : "Generate"}
          </button>

          {isPro ? <span className="pill pillGood">Full access</span> : <span className="pill pillPro">Preview only</span>}
        </div>

        {isPro ? (
          <div className="row">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <button className="v-btn" onClick={savePlan} disabled={!plan}>Save Plan</button>
          </div>
        ) : null}

        <p className="mini" style={{ marginTop: 10 }}>
          PRO: exact shopping list from your bar + save plans. Free: preview menu only.
        </p>
      </div>

      <div className="hr" />

      <div className="grid2">
        <div className="drinkCard">
          <h3 className="drinkName">Menu</h3>
          <p className="mini">Curated lineup for your vibe.</p>

          <div className="kv">
            {(plan?.menu || []).map((d: any) => (
              <span className="pill" key={d.id}>🍸 {d.name}</span>
            ))}
          </div>

          <div className="hr" />

          <div className="kv">
            <span className="pill pillWarn">Estimated drinks: {plan?.scale?.drinks ?? "—"}</span>
            <span className="pill pillWarn">Estimated bottles: {plan?.scale?.bottles ?? "—"}</span>
          </div>
        </div>

        <div className="drinkCard">
          <h3 className="drinkName">Shopping List</h3>
          <p className="mini">PRO computes missing items from your bar.</p>

          {!isPro ? (
            <div className="panel" style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>PRO required</div>
              <p className="subtle">Upgrade to get the exact missing items and grouped shopping list.</p>
            </div>
          ) : (
            <>
              {(plan?.shoppingGroups || []).map((g: any) => (
                <div key={g.group} style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>{g.group}</div>
                  <div className="kv">
                    {g.items.map((x: string) => (
                      <span className="pill pillWarn" key={x}>🛒 {x}</span>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {isPro ? (
        <>
          <div className="hr" />
          <div className="panel">
            <div className="row rowSpace">
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Saved Party Plans</div>
                <div className="mini">Retention feature: people come back to reuse plans.</div>
              </div>
              <button className="v-btn v-btnSmall" onClick={loadSavedPlans}>Refresh</button>
            </div>

            <div className="hr" />

            <div className="grid2">
              {plans.map((p) => (
                <div key={p.id} className="drinkCard">
                  <div className="row rowSpace">
                    <div>
                      <div style={{ fontWeight: 900 }}>{p.title}</div>
                      <div className="mini">
                        {p.guestCount} guests • {p.vibe} • {new Date(p.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button className="v-btn v-btnSmall v-btnDanger" onClick={() => deletePlan(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {plans.length === 0 ? (
              <p className="mini" style={{ marginTop: 10 }}>
                Save your first plan above. This is what makes PRO feel permanent.
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}