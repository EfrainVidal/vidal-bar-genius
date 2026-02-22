import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

/**
 * Party plan persistence (PRO retention feature)
 */

export async function GET() {
  const { userId } = await getAccess();

  const plans = await prisma.partyPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ plans });
}

const SaveSchema = z.object({
  title: z.string().min(2).max(80),
  guestCount: z.number().min(2).max(60),
  vibe: z.string().min(2).max(20),
  planJson: z.string().min(2)
});

export async function POST(req: Request) {
  const { userId, isPro } = await getAccess();
  if (!isPro) {
    return NextResponse.json({ error: "PRO_REQUIRED", message: "Upgrade to PRO to save party plans." }, { status: 402 });
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
      planJson: parsed.data.planJson
    }
  });

  return NextResponse.json({ plan });
}

const DeleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: Request) {
  const { userId, isPro } = await getAccess();
  if (!isPro) {
    return NextResponse.json({ error: "PRO_REQUIRED" }, { status: 402 });
  }

  const body = await req.json().catch(() => null);
  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.partyPlan.deleteMany({ where: { id: parsed.data.id, userId } });
  return NextResponse.json({ ok: true });
}