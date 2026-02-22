"use client";

import { useEffect, useMemo, useState } from "react";
import DrinkCard from "@/app/components/DrinkCard";
import PaywallCard from "@/app/components/PaywallCard";
import Modal from "@/app/components/ui/Modal";
import { recommendNextIngredients } from "@/lib/drinks";
import { track } from "@/lib/analytics";

/**
 * MakeClient — monetization optimized + analytics
 */
export default function MakeClient({ isPro }: { isPro: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [limitHit, setLimitHit] = useState(false);
  const [saveLimitHit, setSaveLimitHit] = useState(false);

  const [nearMissOpen, setNearMissOpen] = useState(false);
  const [nearMiss, setNearMiss] = useState<any | null>(null);

  const title = useMemo(() => (isPro ? "Make Drinks (PRO)" : "Make Drinks"), [isPro]);

  async function run() {
    try {
      setLoading(true);
      setLimitHit(false);

      track("make_run", { isPro, hasQuery: Boolean(query.trim()) });

      const res = await fetch("/api/make", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() || undefined })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "DAILY_LIMIT") {
          setLimitHit(true);
          track("make_daily_limit_hit", { isPro });
        }
        throw new Error(data?.message || data?.error || "Request failed");
      }

      const r = data.results || [];
      setResults(r);

      // Near-miss trigger (best conversion moment)
      if (!isPro) {
        const best = r[0];
        if (best && best.score >= 80 && best.score < 100 && (best.missing?.length ?? 0) <= 2) {
          setNearMiss(best);
          setNearMissOpen(true);
          track("make_near_miss_shown", {
            drink: best?.drink?.name,
            score: best?.score,
            missingCount: best?.missing?.length ?? 0
          });
        }
      }
    } catch (e: any) {
      if (!limitHit) alert(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function saveDrink(r: any) {
    try {
      setSaveLimitHit(false);

      track("recipe_save_attempt", { isPro, drink: r?.drink?.name });

      const payload = {
        name: r.drink.name,
        recipeJson: JSON.stringify(r.drink),
        notes: r.missing?.length ? `Missing: ${r.missing.join(", ")}` : undefined
      };

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "SAVE_LIMIT") {
          setSaveLimitHit(true);
          track("recipe_save_limit_hit", { isPro });
          return;
        }
        throw new Error(data?.message || data?.error || "Save failed");
      }

      track("recipe_saved", { isPro, drink: r?.drink?.name });
      alert("Saved ✅");
    } catch (e: any) {
      alert(e.message || "Save error");
    }
  }

  const nextBuys = recommendNextIngredients(results, 3);

  useEffect(() => {
    track("page_view", { page: "make", isPro });
    run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className="pageTitle">{title} 🍸</h1>
      <p className="subtle">Match drinks based on your bar. Free is useful. PRO is unfair.</p>

      <div className="hr" />

      {!isPro && limitHit ? (
        <PaywallCard
          source="make_daily_limit"
          title="Free daily limit reached"
          bullets={[
            "More daily drink matches",
            "Party Mode: exact menu + shopping list",
            "Bigger recipe vault"
          ]}
        />
      ) : null}

      <div className="panel">
        <div className="row">
          <input
            className="input"
            placeholder='Try: "margarita", "classic", "party"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="v-btn v-btnPrimary" onClick={run} disabled={loading}>
            {loading ? "Matching…" : "Match"}
          </button>
        </div>

        {nextBuys.length > 0 ? (
          <>
            <div className="hr" />
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Your next best ingredients</div>
            <p className="mini">Buy one of these and your match % jumps fast.</p>
            <div className="kv">
              {nextBuys.map((x) => (
                <span className="pill pillWarn" key={x}>🛒 {x}</span>
              ))}
            </div>
          </>
        ) : null}

        <p className="mini" style={{ marginTop: 10 }}>
          Free shows top results and has a daily cap. PRO unlocks deeper results + Party Mode.
        </p>
      </div>

      <div className="hr" />

      <div className="grid2">
        {results.map((r) => (
          <DrinkCard key={r.drink.id} r={r} onSave={() => saveDrink(r)} />
        ))}
      </div>

      {!isPro ? (
        <div style={{ marginTop: 14 }}>
          <PaywallCard
            source="make_bottom"
            bullets={[
              "Party Mode: exact shopping list from your bar",
              "Higher daily matching limit",
              "Bigger saved recipe vault"
            ]}
          />
        </div>
      ) : null}

      <Modal
        open={nearMissOpen}
        title="You’re 1 ingredient away 👀"
        onClose={() => setNearMissOpen(false)}
      >
        <div className="row rowSpace">
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{nearMiss?.drink?.name}</div>
            <div className="mini">
              Match {nearMiss?.score}% • Missing: {nearMiss?.missing?.join(", ")}
            </div>
          </div>
        </div>

        <div className="hr" />

        <PaywallCard
          source="make_near_miss_modal"
          title="Unlock 1-click shopping lists"
          bullets={[
            "Party Mode: exact shopping list + scaling",
            "More daily matches",
            "Bigger saved vault"
          ]}
        />
      </Modal>

      <Modal
        open={saveLimitHit}
        title="Your vault is full"
        onClose={() => setSaveLimitHit(false)}
      >
        <p className="subtle">
          Free save slots are maxed. PRO unlocks a bigger vault and Party Mode.
        </p>
        <div className="hr" />
        <PaywallCard
          source="save_limit_modal"
          title="Upgrade to keep saving"
          bullets={[
            "Bigger recipe vault",
            "Party Mode: menu + exact shopping list",
            "Higher daily match limit"
          ]}
        />
      </Modal>
    </>
  );
}