import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/access.server";

/**
 * POST /api/billing/checkout
 * Creates Stripe Checkout Session for lifetime PRO.
 *
 * CRITICAL:
 * - Always returns JSON (even on failures) so the client never crashes on res.json().
 */
export async function POST(req: Request) {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const STRIPE_PRICE_ID_PRO = process.env.STRIPE_PRICE_ID_PRO;
    const APP_URL = process.env.APP_URL;

    // Hard fail with JSON if env is missing
    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    if (!STRIPE_PRICE_ID_PRO) {
      return NextResponse.json({ error: "Missing STRIPE_PRICE_ID_PRO" }, { status: 500 });
    }
    if (!APP_URL) {
      return NextResponse.json({ error: "Missing APP_URL" }, { status: 500 });
    }

    // Must have a session user
    const userId = await getUserIdOrNull();
    if (!userId) {
      return NextResponse.json(
        { error: "Session missing. Refresh the page and try again." },
        { status: 401 }
      );
    }

    // Ensure user exists (prevents crash)
    await prisma.user.upsert({
      where: { id: userId },
      update: { lastSeenAt: new Date() },
      create: { id: userId, lastSeenAt: new Date() },
    });

    // Optional attribution
    let source = "unknown";
    try {
      const body = await req.json().catch(() => null);
      if (body?.source && typeof body.source === "string") source = body.source;
    } catch {
      // ignore
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: STRIPE_PRICE_ID_PRO, quantity: 1 }],
      success_url: `${APP_URL}/pricing?success=1`,
      cancel_url: `${APP_URL}/pricing?canceled=1`,
      client_reference_id: userId,
      metadata: { userId, source },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Checkout error:", err?.message || err);
    return NextResponse.json(
      { error: "Checkout failed", detail: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}