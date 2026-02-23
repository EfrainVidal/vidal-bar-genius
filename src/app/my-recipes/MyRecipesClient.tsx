"use client";

import { useEffect, useState } from "react";
import PaywallCard from "@/app/components/PaywallCard";
import { safeJsonParse } from "@/lib/env.server";

/**
 * Saved recipes:
 * - Free limited slots
 * - Pro unlimited (practically)
 */
export default function MyRecipesClient({ isPro }: { isPro: boolean }) {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/recipes");
    const data = await res.json();
    setRecipes(data.recipes || []);
  }

  async function remove(id: string) {
    const ok = confirm("Delete this saved recipe?");
    if (!ok) return;

    await fetch("/api/recipes", {
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
      <h1 className="pageTitle">Saved Recipes 📌</h1>
      <p className="subtle">Your personal vault. Save what you actually like.</p>

      <div className="hr" />

      {!isPro ? (
        <PaywallCard
          title="Save more with PRO"
          bullets={[
            "Bigger recipe vault",
            "Party Mode menu builder",
            "Higher daily match limit"
          ]}
        />
      ) : null}

      <div className="hr" />

      <div className="grid2">
        {recipes.map((r) => {
          const drink = safeJsonParse<any>(r.recipeJson);

          return (
            <div key={r.id} className="drinkCard">
              <div className="row rowSpace">
                <div>
                  <h3 className="drinkName">{r.name}</h3>
                  <div className="mini">{drink?.glass ? `${drink.glass} • ` : ""}{drink?.method || "Saved recipe"}</div>
                </div>
                <button className="v-btn v-btnSmall v-btnDanger" onClick={() => remove(r.id)}>
                  Delete
                </button>
              </div>

              {r.notes ? (
                <>
                  <div className="hr" />
                  <div className="mini"><b>Notes:</b> {r.notes}</div>
                </>
              ) : null}

              {drink?.ingredients?.length ? (
                <>
                  <div className="hr" />
                  <div className="kv">
                    {drink.ingredients.map((i: any) => (
                      <span className="pill" key={i.name}>
                        {i.amount} • {i.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {recipes.length === 0 ? (
        <div className="panel">
          <div style={{ fontWeight: 800, marginBottom: 6 }}>No saves yet</div>
          <p className="subtle">
            Go to <b>Make Drinks</b> and hit <b>Save</b> on anything you like.
          </p>
        </div>
      ) : null}
    </>
  );
}