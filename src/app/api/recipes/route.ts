import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS } from "@/lib/limits";

/**
 * GET /api/recipes
 * Returns saved recipes.
 */
export async function GET() {
  const { userId } = await getAccess();

  const recipes = await prisma.savedRecipe.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ recipes });
}

const SaveSchema = z.object({
  name: z.string().min(2).max(80),
  recipeJson: z.string().min(2),
  notes: z.string().max(400).optional()
});

/**
 * POST /api/recipes
 * Saves a recipe (free tier has a slot limit).
 */
export async function POST(req: Request) {
  const { userId, isPro } = await getAccess();
  const body = await req.json().catch(() => null);
  const parsed = SaveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid recipe" }, { status: 400 });
  }

  if (!isPro) {
    const count = await prisma.savedRecipe.count({ where: { userId } });
    if (count >= FREE_LIMITS.saveSlots) {
      return NextResponse.json(
        { error: "SAVE_LIMIT", message: "Free save slots full. Upgrade to PRO for a bigger vault." },
        { status: 402 }
      );
    }
  }

  const recipe = await prisma.savedRecipe.create({
    data: {
      userId,
      name: parsed.data.name,
      notes: parsed.data.notes,
      recipeJson: parsed.data.recipeJson
    }
  });

  return NextResponse.json({ recipe });
}

const DeleteSchema = z.object({ id: z.string().min(1) });

/**
 * DELETE /api/recipes
 * Deletes a saved recipe.
 */
export async function DELETE(req: Request) {
  const { userId } = await getAccess();
  const body = await req.json().catch(() => null);
  const parsed = DeleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.savedRecipe.deleteMany({
    where: { id: parsed.data.id, userId }
  });

  return NextResponse.json({ ok: true });
}