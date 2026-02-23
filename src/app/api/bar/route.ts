// src/app/api/bar/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

/**
 * Helper: get a non-null userId or return a 401 response.
 * Prisma expects `string | undefined` (not null), so we normalize here.
 */
async function getUserIdOr401() {
  const access = await getAccess();
  const userId = access?.userId ?? undefined; // ✅ null -> undefined

  if (!userId) {
    return { userId: undefined, unauthorized: true as const };
  }

  return { userId, unauthorized: false as const };
}

/**
 * GET /api/bar
 * Returns ingredients in the user's bar.
 */
export async function GET() {
  const { userId, unauthorized } = await getUserIdOr401();
  if (unauthorized || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { userId }, // ✅ string (never null)
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ingredients });
}

const AddSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(40),
});

/**
 * POST /api/bar
 * Adds an ingredient.
 */
export async function POST(req: Request) {
  const { userId, unauthorized } = await getUserIdOr401();
  if (unauthorized || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ingredient" }, { status: 400 });
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      userId, // ✅ string (never null)
      name: parsed.data.name,
      type: parsed.data.type,
    },
  });

  return NextResponse.json({ ingredient });
}

const DeleteSchema = z.object({
  id: z.string().min(1),
});

/**
 * DELETE /api/bar
 * Deletes an ingredient by id (must belong to user).
 */
export async function DELETE(req: Request) {
  const { userId, unauthorized } = await getUserIdOr401();
  if (unauthorized || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.ingredient.deleteMany({
    where: { id: parsed.data.id, userId }, // ✅ string (never null)
  });

  return NextResponse.json({ ok: true });
}