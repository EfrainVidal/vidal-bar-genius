// src/app/api/party-plans/route.ts
// (Keep your existing filename/path if different—just paste this content into that route.)

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access.server";
import { prisma } from "@/lib/prisma";

/**
 * Party plan persistence (PRO retention feature)
 */

export async function GET() {
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string before Prisma calls
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;

    const plans = await prisma.partyPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (err) {
    console.error("GET party plans error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const SaveSchema = z.object({
  title: z.string().min(2).max(80),
  guestCount: z.number().min(2).max(60),
  vibe: z.string().min(2).max(20),
  planJson: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;
    const isPro: boolean = !!access.isPro;

    if (!isPro) {
      return NextResponse.json(
        { error: "PRO_REQUIRED", message: "Upgrade to PRO to save party plans." },
        { status: 402 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = SaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = await prisma.partyPlan.create({
      data: {
        userId,
        title: parsed.data.title,
        guestCount: parsed.data.guestCount,
        vibe: parsed.data.vibe,
        planJson: parsed.data.planJson,
      },
    });

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("POST party plans error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const DeleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: Request) {
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;
    const isPro: boolean = !!access.isPro;

    if (!isPro) {
      return NextResponse.json({ error: "PRO_REQUIRED" }, { status: 402 });
    }

    const body = await req.json().catch(() => null);
    const parsed = DeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.partyPlan.deleteMany({
      where: { id: parsed.data.id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE party plans error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}