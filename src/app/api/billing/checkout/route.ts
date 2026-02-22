import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access";
import { getStripe } from "@/lib/stripe";
import { assertEnv } from "@/lib/utils";

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout session (one-time payment).
 *
 * Security notes:
 * - We do NOT trust the client for pricing
 * - We only use STRIPE_PRICE_ID_PRO from env
 * - We include userId in metadata so webhook can grant PRO
 */
export async function POST() {
  const { userId, isPro } = await getAccess();
  if (isPro) {
    return NextResponse.json({ error: "Already PRO" }, { status: 400 });
  }

  const stripe = getStripe();

  const priceId = assertEnv("STRIPE_PRICE_ID_PRO");
  const appUrl = assertEnv("APP_URL");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/party?upgraded=1`,
    cancel_url: `${appUrl}/?canceled=1`,
    metadata: { userId },
    allow_promotion_codes: true
  });

  return NextResponse.json({ url: session.url });
}