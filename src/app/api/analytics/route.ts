import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/analytics
 * Minimal event collection.
 *
 * REQUIREMENTS:
 * - Must include "x-user-id" header
 * - Reject anonymous requests
 */

const Schema = z.object({
  event: z.string().min(2).max(80),
  meta: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    // Headers.get() returns string | null
    const userIdHeader = req.headers.get("x-user-id");

    // Reject if missing
    if (!userIdHeader) {
      return NextResponse.json(
        { error: "Missing x-user-id" },
        { status: 401 }
      );
    }

    // Now guaranteed string (fixes TS error)
    const userId: string = userIdHeader;

    // Parse body safely
    const body = await req.json().catch(() => null);
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid event" },
        { status: 400 }
      );
    }

    // Save event
    await prisma.analyticsEvent.create({
      data: {
        userId,
        event: parsed.data.event,
        metaJson: parsed.data.meta
          ? JSON.stringify(parsed.data.meta)
          : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics POST error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}