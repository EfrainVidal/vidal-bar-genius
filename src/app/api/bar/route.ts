import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bar
 * Returns ingredients in the user's bar.
 */
export async function GET() {
  const { userId } = await getAccess();

  const ingredients = await prisma.ingredient.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ ingredients });
}

const AddSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(40)
});

/**
 * POST /api/bar
 * Adds an ingredient.
 */
export async function POST(req: Request) {
  const { userId } = await getAccess();
  const body = await req.json().catch(() => null);

  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ingredient" }, { status: 400 });
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      userId,
      name: parsed.data.name,
      type: parsed.data.type
    }
  });

  return NextResponse.json({ ingredient });
}

const DeleteSchema = z.object({
  id: z.string().min(1)
});

/**
 * DELETE /api/bar
 * Deletes an ingredient by id (must belong to user).
 */
export async function DELETE(req: Request) {
  const { userId } = await getAccess();
  const body = await req.json().catch(() => null);

  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.ingredient.deleteMany({
    where: { id: parsed.data.id, userId }
  });

  return NextResponse.json({ ok: true });
}