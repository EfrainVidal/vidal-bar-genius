// src/lib/stripe.ts
import "server-only";

import Stripe from "stripe";
import { assertEnv } from "@/lib/env.server";

/**
 * Server-only Stripe helper.
 * Only import this from:
 * - Route Handlers (src/app/api/**)
 * - Server Components
 *
 * Never import from Client Components ("use client").
 */

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(assertEnv("STRIPE_SECRET_KEY"), {
    });
  }
  return stripeSingleton;
}