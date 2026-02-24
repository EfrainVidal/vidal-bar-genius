// FILE: src/app/help/page.tsx
import ContactForm from "@/app/components/ContactForm";

/**
 * Help & Support page (Server Component)
 * - Uses async Server Component pattern (Next.js App Router)
 * - Renders FAQ + Contact panel
 * - The form itself is a Client Component to handle interaction + fetch
 */
export default async function HelpPage() {
  // Server component can do async work here later if you want (e.g. load FAQs from DB)
  // Keeping it static + fast for now.
  const faqs: Array<{ q: string; a: React.ReactNode }> = [
    {
      q: "How does Vidal Bar Genius pick drinks for my bar?",
      a: (
        <>
          We compare your saved ingredients against our drink database and rank matches so you see
          cocktails you can actually make (or are very close to making).
        </>
      ),
    },
    {
      q: "Do I need an account to use the app?",
      a: (
        <>
          No. You can start in guest mode. If you choose to log in later, we’ll link your session so
          you can keep your bar, recipes, and usage.
        </>
      ),
    },
    {
      q: "What’s included in PRO?",
      a: (
        <>
          PRO removes free limits and unlocks more features (like higher usage caps). If you’re
          already subscribed and something looks locked, try logging out and logging back in.
        </>
      ),
    },
    {
      q: "Party Mode didn’t generate what I expected — what should I do?",
      a: (
        <>
          Party Mode works best when your bar ingredients are up to date. Add your key bottles/mixers
          first, then re-run Party Mode to get a more accurate shopping list.
        </>
      ),
    },
    {
      q: "I’m having trouble logging in with email magic links.",
      a: (
        <>
          Check spam/junk folders and make sure you’re using the same email each time. If the link
          expired, request a new one. Some work email systems can rewrite links—try a personal email
          if it keeps failing.
        </>
      ),
    },
  ];

  return (
    <main className="panel" style={{ maxWidth: 980, margin: "0 auto" }}>
      <div className="pageTitle">Help &amp; Support</div>
      <p className="subtle" style={{ marginTop: 6 }}>
        Quick answers, troubleshooting, and a way to reach us if you need help with your bar,
        recipes, Party Mode, or billing.
      </p>

      {/* FAQ */}
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="pill" style={{ display: "inline-block", marginBottom: 10 }}>
          FAQ
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {faqs.map((item, idx) => (
            // Using <details> gives a native accessible accordion (keyboard + screen readers)
            <details
              key={idx}
              className="panel"
              style={{
                padding: 12,
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  listStyle: "none",
                }}
              >
                {item.q}
              </summary>
              <div className="subtle" style={{ marginTop: 10, lineHeight: 1.5 }}>
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="pill" style={{ display: "inline-block", marginBottom: 10 }}>
          Contact
        </div>

        <p className="subtle" style={{ marginTop: 0 }}>
          Prefer email? Reach us at{" "}
          <a href="mailto:vidalbargenius@gmail.com" className="v-btn" style={{ padding: "2px 10px" }}>
            support - vidalbargenius@gmail.com
          </a>{" "}
          (replace this anytime).
        </p>

        {/* Client Component handles form interaction + submit */}
        <ContactForm />
      </section>

      {/* Small footer note */}
      <div className="subtle" style={{ marginTop: 14 }}>
        Tip: When reporting an issue, include what you were trying to do, what you expected, and what
        happened instead.
      </div>
    </main>
  );
}