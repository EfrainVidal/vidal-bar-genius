// src/app/api/bar/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

/**
 * Small helper that guarantees we have a real string userId.
 * This avoids the common TypeScript issue where userId is `string | null`.
 */
async function requireUserId(): Promise<string> {
  const access = await getAccess();

  // If getAccess returns null/undefined or userId is missing, reject.
  if (!access || typeof access.userId !== "string" || access.userId.length === 0) {
    throw new Error("UNAUTHORIZED");
  }

  // ✅ Guaranteed string from here on
  return access.userId;
}

/**
 * GET /api/bar
 * Returns ingredients in the user's bar.
 */
export async function GET() {
  try {
    const userId = await requireUserId();

    const ingredients = await prisma.ingredient.findMany({
      where: { userId }, // ✅ userId is string (NOT null)
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ingredients });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("GET /api/bar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
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
  try {
    const userId = await requireUserId();

    const body = await req.json().catch(() => null);
    const parsed = AddSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid ingredient" }, { status: 400 });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        userId, // ✅ string
        name: parsed.data.name,
        type: parsed.data.type,
      },
    });

    return NextResponse.json({ ingredient });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("POST /api/bar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const DeleteSchema = z.object({
  id: z.string().min(1),
});

/**
 * DELETE /api/bar
 * Deletes an ingredient by id (must belong to user).
 */
export async function DELETE(req: Request) {
  try {
    const userId = await requireUserId();

    const body = await req.json().catch(() => null);
    const parsed = DeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.ingredient.deleteMany({
      where: { id: parsed.data.id, userId }, // ✅ string
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("DELETE /api/bar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}