import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/analytics
 * Minimal event collection.
 *
 * Why server-side storage?
 * - You own the data
 * - No external analytics vendor needed
 * - Enough to measure conversion points
 */

const Schema = z.object({
  event: z.string().min(2).max(80),
  meta: z.record(z.string(), z.any()).optional()
});

export async function POST(req: Request) {
  const { userId } = await getAccess();

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  await prisma.analyticsEvent.create({
    data: {
      userId,
      event: parsed.data.event,
      metaJson: parsed.data.meta ? JSON.stringify(parsed.data.meta) : null
    }
  });

  // Return OK but no sensitive data
  return NextResponse.json({ ok: true });
}