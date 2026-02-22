import Link from "next/link";
import { getIsPro, hasAnonSession } from "@/lib/access";

/**
 * AppHeader:
 * - Adds /pricing route for conversion
 * - Keeps consistent Vidal UI
 */
export default async function AppHeader() {
  const isPro = await getIsPro();
  const hasSession = await hasAnonSession();

  return (
    <div style={{ borderBottom: "1px solid rgba(233,236,242,0.10)" }}>
      <div className="container">
        <div className="row rowSpace">
          <div className="row">
            <Link href="/" style={{ fontWeight: 800, letterSpacing: "-0.2px" }}>
              🍸 Vidal Bar Genius
            </Link>

            {!isPro ? (
              <span className="pill pillPro">PRO • Unlock Party Mode</span>
            ) : (
              <span className="pill pillGood">PRO ACTIVE</span>
            )}

            {hasSession ? <span className="pill">Session ✓</span> : <span className="pill">No session</span>}
          </div>

          <div className="row">
            <Link className="v-btn v-btnSmall" href="/make">Make Drinks</Link>
            <Link className="v-btn v-btnSmall" href="/bar">My Bar</Link>
            <Link className="v-btn v-btnSmall" href="/my-recipes">Saved</Link>
            <Link className="v-btn v-btnSmall" href="/party">Party Mode</Link>
            <Link className="v-btn v-btnSmall" href="/pricing">Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}