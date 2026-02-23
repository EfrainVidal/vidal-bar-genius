// src/app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { assertEnv } from "@/lib/env.server";

export async function POST(req: Request) {
  const stripe = getStripe();

  const sig = (await headers()).get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();
  const whSecret = assertEnv("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret) as Stripe.Event;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  // --- Dedupe (retry-safe) ---
  const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });

  if (existing?.processedAt) {
    return NextResponse.json({ received: true, deduped: true });
  }

  if (!existing) {
    try {
      await prisma.stripeEvent.create({
        data: { id: event.id, type: event.type },
      });
    } catch {
      // If a concurrent request created it, continue
      const again = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
      if (again?.processedAt) return NextResponse.json({ received: true, deduped: true });
    }
  }

  try {
    // Treat async success the same as completed (harmless if you never use async methods)
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session?.metadata?.userId;
      if (!userId) throw new Error("Missing userId in session.metadata");

      const expectedPriceId = assertEnv("STRIPE_PRICE_ID_PRO");

      // Validate purchased price
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 20 });
      const ok = lineItems.data.some((li) => li.price?.id === expectedPriceId);
      if (!ok) throw new Error("Price mismatch (not PRO price)");

      const source = (session?.metadata?.source || "unknown").slice(0, 64);

      const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;

      // Grant PRO + store Stripe ids (upsert so it never fails)
      await prisma.user.upsert({
        where: { id: userId },
        update: {
          isPro: true,
          lastSeenAt: new Date(),
          stripeCustomerId: stripeCustomerId ?? undefined,
          stripePaymentIntentId: paymentIntentId ?? undefined,
        },
        create: {
          id: userId,
          isPro: true,
          proSince: new Date(),
          lastSeenAt: new Date(),
          stripeCustomerId: stripeCustomerId ?? undefined,
          stripePaymentIntentId: paymentIntentId ?? undefined,
        },
      });

      // Preserve original proSince if it already exists
      await prisma.user.updateMany({
        where: { id: userId, proSince: null },
        data: { proSince: new Date() },
      });

      console.log("Granted PRO:", userId, "source:", source);
    }

    // Mark processed (use updateMany so we never throw if row is missing)
    await prisma.stripeEvent.updateMany({
      where: { id: event.id },
      data: { processedAt: new Date(), error: null },
    });

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("Webhook handling error:", e?.message || e);

    // Store error but DO NOT mark processed — Stripe will retry and we’ll try again
    await prisma.stripeEvent.updateMany({
      where: { id: event.id },
      data: { error: String(e?.message || "Unknown error") },
    });

    return NextResponse.json(
      { error: "Webhook error", detail: e?.message || "Unknown" },
      { status: 500 }
    );
  }
}