// src/app/api/recipes/route.ts

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
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string (fixes Prisma/TS null errors)
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;

    const recipes = await prisma.savedRecipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ recipes });
  } catch (err) {
    console.error("GET /api/recipes error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const SaveSchema = z.object({
  name: z.string().min(2).max(80),
  recipeJson: z.string().min(2),
  notes: z.string().max(400).optional(),
});

/**
 * POST /api/recipes
 * Saves a recipe (free tier has a slot limit).
 */
export async function POST(req: Request) {
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;
    const isPro: boolean = !!access.isPro;

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
        recipeJson: parsed.data.recipeJson,
      },
    });

    return NextResponse.json({ recipe });
  } catch (err) {
    console.error("POST /api/recipes error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const DeleteSchema = z.object({ id: z.string().min(1) });

/**
 * DELETE /api/recipes
 * Deletes a saved recipe.
 */
export async function DELETE(req: Request) {
  try {
    const access = await getAccess();

    // ✅ Guarantee userId is a real string
    if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;

    const body = await req.json().catch(() => null);
    const parsed = DeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.savedRecipe.deleteMany({
      where: { id: parsed.data.id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/recipes error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}