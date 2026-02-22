import type { MatchResult } from "@/lib/drinks";

/**
 * DrinkCard: shows a matched drink result with missing ingredients.
 */
export default function DrinkCard({
  r,
  onSave
}: {
  r: MatchResult;
  onSave?: () => void;
}) {
  const score = r.score;

  return (
    <div className="drinkCard">
      <div className="row rowSpace">
        <div>
          <h3 className="drinkName">{r.drink.name}</h3>
          <div className="mini">
            {r.drink.glass} • {r.drink.method}
          </div>
        </div>

        <div className="row">
          <span className={`pill ${score >= 80 ? "pillGood" : score >= 50 ? "pillWarn" : ""}`}>
            Match {score}%
          </span>
          {onSave ? (
            <button className="v-btn v-btnSmall" onClick={onSave}>
              Save
            </button>
          ) : null}
        </div>
      </div>

      <div className="hr" />

      <div className="mini" style={{ marginBottom: 8, fontWeight: 700 }}>
        Ingredients
      </div>

      <div className="kv">
        {r.drink.ingredients.map((i) => (
          <span className="pill" key={i.name}>
            {i.amount} • {i.name}
          </span>
        ))}
      </div>

      {r.missing.length > 0 ? (
        <>
          <div className="hr" />
          <div className="mini" style={{ fontWeight: 700, marginBottom: 6 }}>
            Missing (what to buy)
          </div>
          <div className="kv">
            {r.missing.map((m) => (
              <span className="pill pillWarn" key={m}>
                {m}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}