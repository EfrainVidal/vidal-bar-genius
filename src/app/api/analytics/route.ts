import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/analytics
 * Minimal event collection.
 *
 * IMPORTANT:
 * - In our Prisma schema, AnalyticsEvent.userId is REQUIRED.
 * - So we must reject anonymous events (no x-user-id header).
 */

const Schema = z.object({
  event: z.string().min(2).max(80),
  meta: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  // Headers.get() returns string | null
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Missing x-user-id" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  await prisma.analyticsEvent.create({
    data: {
      userId, // REQUIRED by schema
      event: parsed.data.event,
      metaJson: parsed.data.meta ? JSON.stringify(parsed.data.meta) : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}