// src/app/pricing/page.tsx

import Link from "next/link";
import { getAccess } from "@/lib/access.server";
import PaywallCard from "@/app/components/PaywallCard";
import LoginBox from "@/app/components/ui/LoginBox";

/**
 * /pricing — built to convert:
 * - Shows login when needed (so PRO works across devices)
 * - Above-the-fold price + CTA
 * - Clear comparison
 * - FAQ that answers objections
 * - No fake social proof
 */
type SP = { [key: string]: string | string[] | undefined };

export default async function PricingPage({
  searchParams,
}: {
  /**
   * ✅ Next.js 15+ expects searchParams to be a Promise (or undefined).
   * ❌ Do NOT use `Promise<SP> | SP` — that breaks PageProps typing in builds.
   */
  searchParams?: Promise<SP>;
}) {
  const { userId, isPro } = await getAccess();

  /**
   * ✅ Next.js 15+:
   * `searchParams` is async, so we await it.
   * If it's undefined (possible during certain render modes), we handle it.
   */
  const sp: SP | undefined = searchParams ? await searchParams : undefined;

  // Query param flags
  const success = sp?.success === "1";
  const canceled = sp?.canceled === "1";
  const loggedIn = sp?.logged_in === "1";

  const loginError = typeof sp?.login_error === "string" ? sp.login_error : null;

  return (
    <main className="container">
      <header style={{ marginBottom: 14 }}>
        <h1 className="pageTitle">Pricing 💳</h1>
        <p className="subtle" style={{ marginTop: 6 }}>
          Free stays useful forever. PRO unlocks the hosting features that make
          parties effortless.
        </p>

        {/* Trust / risk reducers */}
        <div style={{ marginTop: 10 }} className="kv">
          <span className="pill">🔒 Secure checkout (Stripe)</span>
          <span className="pill">⚡ Instant unlock</span>
          <span className="pill">📱 Mobile-friendly</span>
        </div>

        {/* Logged-in status (prevents confusion + reduces refunds) */}
        <div style={{ marginTop: 10 }} className="kv">
          {userId ? (
            <>
              <span className="pill pillGood">Logged in as: {userId}</span>
              <form action="/api/auth/logout" method="post">
                <button className="v-btn" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <span className="pill pillWarn">
              Not logged in • Login required to buy PRO
            </span>
          )}
        </div>
      </header>

      {/* Status banners */}
      {success ? (
        <div className="panel">
          <div style={{ fontWeight: 900 }}>✅ Payment complete</div>
          <div className="mini" style={{ marginTop: 6 }}>
            If you don’t see PRO immediately, refresh once. (Webhooks can take a
            moment.)
          </div>
        </div>
      ) : null}

      {canceled ? (
        <div className="panel">
          <div style={{ fontWeight: 900 }}>⚠️ Checkout canceled</div>
          <div className="mini" style={{ marginTop: 6 }}>
            No worries — you can try again anytime.
          </div>
        </div>
      ) : null}

      {loggedIn ? (
        <div className="panel">
          <div style={{ fontWeight: 900 }}>✅ Signed in</div>
          <div className="mini" style={{ marginTop: 6 }}>
            You’re now synced across devices.
          </div>
        </div>
      ) : null}

      {loginError ? (
        <div className="panel">
          <div style={{ fontWeight: 900 }}>⚠️ Login failed</div>
          <div className="mini" style={{ marginTop: 6 }}>
            {loginError}
          </div>
        </div>
      ) : null}

      <div className="hr" />

      {/* Login box (only when needed) */}
      {!userId ? (
        <>
          <LoginBox />
          <div className="hr" />
        </>
      ) : null}

      {/* Above-the-fold conversion block */}
      {isPro ? (
        <section className="panel">
          <h2 className="pageTitle" style={{ marginBottom: 6 }}>
            You’re PRO ✅
          </h2>
          <p className="subtle">
            Party Mode is fully unlocked. Build a menu and get an exact shopping
            list in seconds.
          </p>

          <div style={{ marginTop: 12 }} className="row">
            <Link className="v-btn v-btnPrimary" href="/party">
              Open Party Mode
            </Link>
            <Link className="v-btn" href="/make">
              Make Drinks
            </Link>
          </div>
        </section>
      ) : (
        <section className="panel" id="buy">
          <div className="row rowSpace">
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
                Unlock PRO Lifetime
              </div>
              <p className="subtle" style={{ marginTop: 0 }}>
                Built for hosting: menu + exact shopping list based on your real
                bar.
              </p>
            </div>
            <span className="pill pillPro">BEST VALUE</span>
          </div>

          <div className="hr" />

          <div className="kv">
            <span className="pill pillPro">🍸 Party Mode: exact shopping list</span>
            <span className="pill pillPro">📌 Save party plans</span>
            <span className="pill pillPro">🔎 Deeper match results</span>
            <span className="pill pillPro">♾️ Higher limits</span>
          </div>

          <div className="hr" />

          <div className="kv">
            <span className="pill">PRO Monthly (coming soon) • $9/mo</span>
            <span className="pill pillGood">Lifetime • one-time</span>
            <span className="pill">
              Lifetime = lifetime access to PRO features in this app
            </span>
          </div>

          <div style={{ marginTop: 12 }}>
            {userId ? (
              <PaywallCard
                source="pricing"
                title="PRO Lifetime (one-time)"
                bullets={[
                  "Party Mode: menu + exact shopping list from your bar",
                  "Save party plans",
                  "Higher limits + deeper matches",
                  "Support ongoing updates",
                ]}
              />
            ) : (
              <div className="panel">
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>
                  Log in to unlock PRO
                </div>
                <p className="subtle" style={{ marginTop: 0 }}>
                  Login is required so your PRO access follows you on any device.
                </p>
                <Link className="v-btn v-btnPrimary" href="#login">
                  Log in above
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="hr" />

      {/* Comparison grid */}
      <div className="grid2">
        <div className="panel">
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>
            FREE
          </div>
          <p className="subtle" style={{ marginTop: 0 }}>
            Great for casual nights — enough to keep forever.
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
            Free helps you discover what you can make. PRO makes you “host-ready”.
          </p>
        </div>

        <div className="panel">
          <div className="row rowSpace">
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>
                PRO
              </div>
              <p className="subtle" style={{ marginTop: 0 }}>
                For parties, hosting, and “tell me exactly what to buy”.
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

          <p className="mini">
            Upgrade when you want the app to plan the night for you — not just suggest a drink.
          </p>

          {!isPro ? (
            <div style={{ marginTop: 12 }}>
              <Link className="v-btn v-btnPrimary" href="#buy">
                Unlock PRO
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="hr" />

      {/* FAQ */}
      <div className="panel">
        <h2 className="pageTitle" style={{ marginBottom: 6 }}>
          FAQ
        </h2>
        <div className="hr" />

        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900 }}>What am I actually paying for?</div>
            <div className="mini">
              Party Mode is the killer feature: it uses your real bar to generate a menu and an exact shopping list,
              then lets you save plans. That’s what most people upgrade for.
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
              Not today. PRO is a one-time lifetime unlock. (Monthly may come later, but lifetime will always be the best deal.)
            </div>
          </div>
        </div>
      </div>

      {/* Anchor for login section if you want to jump */}
      {!userId ? <div id="login" style={{ height: 1 }} /> : null}
    </main>
  );
}