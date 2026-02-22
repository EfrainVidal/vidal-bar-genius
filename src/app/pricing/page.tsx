import Link from "next/link";
import { getAccess } from "@/lib/access";
import PaywallCard from "@/app/components/PaywallCard";

/**
 * /pricing — built to convert:
 * - Clear comparison
 * - Strong CTA
 * - FAQ that answers objections
 * - Social-proof language (without fake claims)
 */
export default async function PricingPage() {
  const { isPro } = await getAccess();

  return (
    <main className="container">
      <h1 className="pageTitle">Pricing 💳</h1>
      <p className="subtle">
        Free stays useful forever. PRO unlocks the killer features that make hosting easy.
      </p>

      <div className="hr" />

      {isPro ? (
        <div className="panel">
          <h2 className="pageTitle" style={{ marginBottom: 6 }}>You’re PRO ✅</h2>
          <p className="subtle">
            Party Mode is fully unlocked. Go build a menu and shopping list.
          </p>
          <div style={{ marginTop: 10 }} className="row">
            <Link className="v-btn v-btnPrimary" href="/party">Open Party Mode</Link>
            <Link className="v-btn" href="/make">Make Drinks</Link>
          </div>
        </div>
      ) : (
        <PaywallCard
          source="pricing"
          title="PRO Lifetime (one-time)"
          bullets={[
            "Party Mode: exact shopping list from your bar",
            "Save party plans",
            "Higher daily match depth + limits",
            "Support ongoing updates"
          ]}
        />
      )}

      <div className="hr" />

      <div className="grid2">
        <div className="panel">
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>FREE</div>
          <p className="subtle" style={{ marginTop: 0 }}>
            Enough to use forever — perfect for casual nights.
          </p>

          <div className="hr" />

          <div className="kv">
            <span className="pill">✅ My Bar inventory</span>
            <span className="pill">✅ Make Drinks (top results)</span>
            <span className="pill">✅ Daily cap</span>
            <span className="pill">✅ Save a small vault</span>
            <span className="pill pillWarn">⚠️ Party Mode preview only</span>
          </div>

          <div className="hr" />

          <p className="mini">
            Free is designed to hook you. PRO is designed to make you never stress hosting again.
          </p>
        </div>

        <div className="panel">
          <div className="row rowSpace">
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>PRO</div>
              <p className="subtle" style={{ marginTop: 0 }}>
                Built for parties, hosting, and “tell me what to buy”.
              </p>
            </div>
            <span className="pill pillPro">BEST VALUE</span>
          </div>

          <div className="hr" />

          <div className="kv">
            <span className="pill pillPro">🍸 Party Mode: exact shopping list</span>
            <span className="pill pillPro">📌 Save party plans</span>
            <span className="pill pillPro">♾️ Higher limits</span>
            <span className="pill pillPro">🔎 Deeper match results</span>
          </div>

          <div className="hr" />

          {/* Price anchoring (UI-only) */}
          <div className="kv">
            <span className="pill">PRO Monthly (coming soon) • $9/mo</span>
            <span className="pill pillGood">Lifetime • one-time</span>
          </div>

          {!isPro ? (
            <div style={{ marginTop: 12 }}>
              <PaywallCard
                title="Unlock PRO now"
                bullets={[
                  "Exact shopping lists",
                  "Save plans",
                  "Higher limits"
                ]}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="hr" />

      <div className="panel">
        <h2 className="pageTitle" style={{ marginBottom: 6 }}>FAQ</h2>
        <div className="hr" />

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900 }}>What am I actually paying for?</div>
            <div className="mini">
              Party Mode is the killer feature: it uses your real bar to generate a menu and an exact shopping list,
              then lets you save plans. That’s what people upgrade for.
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 900 }}>Is free still useful?</div>
            <div className="mini">
              Yes. You can build your bar, match drinks daily, and save a small vault. PRO just makes it “host-ready”.
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 900 }}>Is this a subscription?</div>
            <div className="mini">
              Not today. PRO is one-time lifetime. (Monthly may come later, but lifetime will always be the best deal.)
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}