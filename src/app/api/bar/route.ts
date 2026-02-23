// src/app/api/bar/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bar
 * Returns ingredients in the user's bar.
 */
export async function GET() {
  try {
    // getAccess() likely returns userId: string | null
    const access = await getAccess();

    // Reject anonymous access (prevents TS null issues + protects user data)
    if (!access?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ guaranteed string from here on
    const userId: string = access.userId;

    const ingredients = await prisma.ingredient.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ingredients });
  } catch (err) {
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
    const access = await getAccess();

    if (!access?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;

    const body = await req.json().catch(() => null);

    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid ingredient" }, { status: 400 });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        userId,
        name: parsed.data.name,
        type: parsed.data.type,
      },
    });

    return NextResponse.json({ ingredient });
  } catch (err) {
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
    const access = await getAccess();

    if (!access?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = access.userId;

    const body = await req.json().catch(() => null);

    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.ingredient.deleteMany({
      where: { id: parsed.data.id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/bar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}