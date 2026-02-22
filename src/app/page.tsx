import Link from "next/link";
import { getAccess } from "@/lib/access";
import PaywallCard from "@/app/components/PaywallCard";
import Row from "@/app/components/ui/Row";

/**
 * Homepage = marketing + conversion.
 * - Clear “start now”
 * - Clear PRO upsell
 * - Shows status (free/pro)
 */
export default async function HomePage() {
  const { isPro } = await getAccess();

  return (
    <main className="container">
      <Row space>
        <div>
          <h1 className="pageTitle">Vidal Bar Genius 🍸</h1>
          <p className="subtle">
            Smart Bar System: track your ingredients, instantly match drinks, and generate a party menu + shopping plan.
          </p>

          <div style={{ marginTop: 10 }} className="row">
            <Link className="v-btn v-btnPrimary" href="/make">Start: Make Drinks</Link>
            <Link className="v-btn" href="/bar">Build My Bar</Link>
            <Link className="v-btn" href="/party">Party Mode</Link>

            {isPro ? <span className="pill pillGood">PRO ACTIVE</span> : <span className="pill pillPro">FREE • Upgrade anytime</span>}
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 420 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>What you get (FREE)</div>
          <div className="kv">
            <span className="pill">✅ Bar inventory</span>
            <span className="pill">✅ Daily drink matches</span>
            <span className="pill">✅ Save a few favorites</span>
          </div>

          <div className="hr" />

          <div style={{ fontWeight: 800, marginBottom: 6 }}>What you get (PRO)</div>
          <div className="kv">
            <span className="pill pillPro">🍸 Party Mode</span>
            <span className="pill pillPro">♾️ Higher limits</span>
            <span className="pill pillPro">📌 Bigger recipe vault</span>
          </div>
        </div>
      </Row>

      <div className="hr" />

      {!isPro ? (
        <PaywallCard
          bullets={[
            "Party Mode menu builder + shopping plan",
            "Higher daily make limit",
            "More saved recipes",
            "Support ongoing updates"
          ]}
        />
      ) : (
        <div className="panel">
          <h2 className="pageTitle" style={{ marginBottom: 6 }}>You’re PRO. Let’s cook. 😈</h2>
          <p className="subtle">Head to Party Mode and build a full menu in minutes.</p>
          <div style={{ marginTop: 10 }}>
            <Link className="v-btn v-btnPrimary" href="/party">Open Party Mode</Link>
          </div>
        </div>
      )}
    </main>
  );
}