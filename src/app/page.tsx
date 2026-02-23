import Link from "next/link";
import { getAccess } from "@/lib/access.server";
import PaywallCard from "@/app/components/PaywallCard";
import Row from "@/app/components/ui/Row";

/**
 * Homepage = marketing + conversion.
 * Goal:
 * - Primary CTA: Make Drinks (instant value)
 * - Secondary CTA: Build Bar
 * - Party Mode CTA routes smartly (PRO -> /party, Free -> /pricing)
 */
export default async function HomePage() {
  const { userId, isPro } = await getAccess();

  return (
    <main className="container">
      <Row space>
        <div>
          <h1 className="pageTitle">Vidal Bar Genius 🍸</h1>
          <p className="subtle">
            Build your bar once. Then get drink matches, party menus, and an exact shopping list in seconds.
          </p>

          <div style={{ marginTop: 10 }} className="row">
            <Link className="v-btn v-btnPrimary" href="/make">
              Start: Make Drinks
            </Link>

            <Link className="v-btn" href="/bar">
              Build My Bar
            </Link>

            {/* Party Mode should push free users toward pricing */}
            <Link className="v-btn" href={isPro ? "/party" : "/pricing"}>
              Party Mode
            </Link>

            {isPro ? (
              <span className="pill pillGood">PRO ACTIVE</span>
            ) : userId ? (
              <span className="pill pillPro">FREE • Upgrade anytime</span>
            ) : (
              <span className="pill pillWarn">Not logged in</span>
            )}
          </div>

          <div className="kv" style={{ marginTop: 12 }}>
            <span className="pill">✅ Uses your real bar inventory</span>
            <span className="pill">✅ No “fake” social proof</span>
            <span className="pill">✅ Stripe-secure checkout</span>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 420 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>FREE gives you:</div>
          <div className="kv" style={{ marginTop: 0 }}>
            <span className="pill">✅ Bar inventory</span>
            <span className="pill">✅ Daily drink matches</span>
            <span className="pill">✅ Save a few favorites</span>
          </div>

          <div className="hr" />

          <div style={{ fontWeight: 800, marginBottom: 6 }}>PRO gives you:</div>
          <div className="kv" style={{ marginTop: 0 }}>
            <span className="pill pillPro">🍸 Party Mode menu + shopping list</span>
            <span className="pill pillPro">♾️ Higher limits</span>
            <span className="pill pillPro">📌 Bigger recipe vault</span>
          </div>

          <p className="mini" style={{ marginTop: 12 }}>
            PRO is for hosting: “tell me what to buy and what to serve.”
          </p>

          <div style={{ marginTop: 10 }} className="row">
            <Link className="v-btn v-btnPrimary" href="/pricing">
              See Pricing
            </Link>
          </div>
        </div>
      </Row>

      <div className="hr" />

      {!isPro ? (
        <PaywallCard
          source="home"
          title="Unlock PRO Lifetime (one-time)"
          bullets={[
            "Party Mode menu builder + exact shopping list",
            "Higher daily make limit",
            "More saved recipes",
            "Support ongoing updates",
          ]}
        />
      ) : (
        <div className="panel">
          <h2 className="pageTitle" style={{ marginBottom: 6 }}>
            You’re PRO. Let’s host. 😈
          </h2>
          <p className="subtle">
            Head to Party Mode and build a full menu in minutes.
          </p>
          <div style={{ marginTop: 10 }}>
            <Link className="v-btn v-btnPrimary" href="/party">
              Open Party Mode
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}