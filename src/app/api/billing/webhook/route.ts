import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { assertEnv } from "@/lib/utils";

/**
 * POST /api/billing/webhook
 * Stripe webhook handler.
 *
 * IMPORTANT:
 * - Must read RAW body via req.text()
 * - Verify signature using STRIPE_WEBHOOK_SECRET
 * - Must validate price ID for safety (optional but recommended)
 */
export async function POST(req: Request) {
  const stripe = getStripe();

  const sig = (await headers()).get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();
  const whSecret = assertEnv("STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    // One-time payments complete here:
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const userId = session?.metadata?.userId as string | undefined;
      if (!userId) throw new Error("Missing userId in metadata");

      // Optional: validate the price id on the session line items
      // This prevents someone from paying for a cheaper product and getting PRO.
      const expectedPriceId = assertEnv("STRIPE_PRICE_ID_PRO");

      // Fetch line items to confirm price
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
      const ok = lineItems.data.some((li) => li.price?.id === expectedPriceId);

      if (!ok) throw new Error("Price mismatch (not PRO price)");

      // Grant PRO
      await prisma.user.update({
        where: { id: userId },
        data: { isPro: true, proSince: new Date() }
      });

      console.log("Granted PRO to user:", userId);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook handling error:", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}