import Stripe from "stripe";
import { assertEnv } from "@/lib/env.server";

/**
 * Stripe SDK instance.
 * Keep apiVersion pinned for predictable behavior.
 */
export function getStripe() {
  const key = assertEnv("STRIPE_SECRET_KEY");

  return new Stripe(key, {
    apiVersion: "2024-06-20"
  });
}