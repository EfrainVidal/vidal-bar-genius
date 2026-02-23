// src/app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/access.server";

/**
 * POST /api/billing/checkout
 * Creates Stripe Checkout Session for lifetime PRO.
 *
 * Guarantees:
 * - Always returns JSON
 * - Requires login (so PRO works on any device)
 * - Short-circuits if user is already PRO
 * - Uses idempotency (client nonce) to prevent duplicate sessions/charges
 * - Writes attribution metadata to both Session + PaymentIntent
 */
export async function POST(req: Request) {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO;

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    if (!STRIPE_PRICE_ID_PRO) {
      return NextResponse.json({ error: "Missing STRIPE_PRICE_ID_PRO" }, { status: 500 });
    }

    // Reliable origin for Stripe redirects (Vercel-safe)
    // Prefer APP_URL if set; otherwise derive from forwarded headers.
    const envAppUrl = process.env.APP_URL;
    const xfHost = req.headers.get("x-forwarded-host");
    const xfProto = req.headers.get("x-forwarded-proto") || "https";
    const origin = envAppUrl || (xfHost ? `${xfProto}://${xfHost}` : null);

    if (!origin) {
      return NextResponse.json({ error: "Missing APP_URL" }, { status: 500 });
    }

    // Must have a logged-in user (email session)
    // This guarantees: buy once, access everywhere.
    const userId = await getUserIdOrNull();
    if (!userId) {
      return NextResponse.json(
        {
          error: "Login required",
          detail:
            "Please log in with email before purchasing so your PRO access works across devices.",
        },
        { status: 401 }
      );
    }

    // Parse attribution safely (never assume JSON)
    let source = "unknown";
    let nonce = "none";

    try {
      // Read raw body as text so we never crash on invalid/empty JSON
      const raw = await req.text();
      if (raw) {
        try {
          const body = JSON.parse(raw);
          if (typeof body?.source === "string") source = body.source;
          if (typeof body?.nonce === "string") nonce = body.nonce;
        } catch {
          // ignore non-JSON bodies
        }
      }
    } catch {
      // ignore
    }

    // Clamp lengths to keep Stripe metadata clean
    source = source.trim().slice(0, 64) || "unknown";
    nonce = nonce.trim().slice(0, 80) || "none";

    // Ensure user exists and check PRO status
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { lastSeenAt: new Date() },
      create: { id: userId, lastSeenAt: new Date() },
      select: { id: true, isPro: true },
    });

    if (user.isPro) {
      // Don’t send PRO users to checkout (prevents accidental double purchase)
      return NextResponse.json(
        { error: "Already PRO", detail: "Your account is already upgraded." },
        { status: 409 }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    // Idempotency: prevents duplicate Checkout Sessions/charges
    // Use a client-generated nonce so cancel->retry creates a fresh session.
    const idempotencyKey = `checkout:${userId}:${nonce}`;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: STRIPE_PRICE_ID_PRO, quantity: 1 }],

        success_url: `${origin}/pricing?success=1`,
        cancel_url: `${origin}/pricing?canceled=1`,

        // Useful for internal reconciliation
        client_reference_id: userId,

        // Session-level metadata (fine)
        metadata: { userId, source, nonce },

        // PaymentIntent-level metadata (better for analytics, disputes, exports)
        payment_intent_data: {
          metadata: { userId, source, nonce, product: "pro_lifetime" },
        },
      },
      { idempotencyKey }
    );

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout failed", detail: "Stripe returned no checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Checkout error:", err?.message || err);
    return NextResponse.json(
      { error: "Checkout failed", detail: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}