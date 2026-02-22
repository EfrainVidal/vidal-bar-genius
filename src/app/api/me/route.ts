import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access";
import { FREE_LIMITS } from "@/lib/limits";

/**
 * GET /api/me
 * Returns session + entitlement + limits so clients can render UI correctly.
 */
export async function GET() {
  const { userId, isPro } = await getAccess();

  return NextResponse.json({
    userId,
    isPro,
    limits: {
      makePerDay: isPro ? 9999 : FREE_LIMITS.makePerDay,
      saveSlots: isPro ? 9999 : FREE_LIMITS.saveSlots
    }
  });
}