// src/app/api/bar/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access.server";
import { prisma } from "@/lib/prisma";

/**
 * This route powers the "My Bar" UI:
 * - GET    /api/bar         -> list ingredients
 * - POST   /api/bar         -> add an ingredient
 * - DELETE /api/bar         -> remove an ingredient
 *
 * Goals:
 * 1) Always return JSON (even on errors) so the client never crashes on res.json()
 * 2) Never call Prisma without a valid userId
 * 3) Validate inputs with zod
 */

/** Standard JSON error response helper */
function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Auth helper:
 * - Returns a real string userId or null
 * - NEVER throws (prevents HTML/empty responses from unexpected auth failures)
 */
async function getAuthId(): Promise<string | null> {
  try {
    const access = await getAccess();
    const userId = access?.userId;

    if (typeof userId === "string" && userId.trim().length > 0) return userId;
    return null;
  } catch (err) {
    // If your auth ever fails unexpectedly, we still return JSON downstream.
    console.error("getAccess() failed in /api/bar:", err);
    return null;
  }
}

/**
 * Safe JSON parser:
 * - If body is empty or invalid JSON, returns {} instead of throwing
 */
async function safeJson(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/** Input validation schemas */
const AddSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(40),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

/**
 * GET /api/bar
 * Returns the user's ingredients.
 */
export async function GET() {
  try {
    const userId = await getAuthId();
    if (!userId) return jsonError("Unauthorized", 401);

    const ingredients = await prisma.ingredient.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, ingredients });
  } catch (err) {
    console.error("GET /api/bar error:", err);
    return jsonError("Server error", 500);
  }
}

/**
 * POST /api/bar
 * Adds a new ingredient to the user's bar.
 */
export async function POST(req: Request) {
  try {
    const userId = await getAuthId();
    if (!userId) return jsonError("Unauthorized", 401);

    // ✅ Never throws (invalid/empty JSON becomes {})
    const body = await safeJson(req);

    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid ingredient", 400);

    const ingredient = await prisma.ingredient.create({
      data: {
        userId,
        name: parsed.data.name,
        type: parsed.data.type,
      },
    });

    return NextResponse.json({ ok: true, ingredient });
  } catch (err) {
    console.error("POST /api/bar error:", err);
    return jsonError("Server error", 500);
  }
}

/**
 * DELETE /api/bar
 * Removes an ingredient by id, but only if it belongs to the user.
 * Uses deleteMany for safety (prevents deleting another user's row).
 */
export async function DELETE(req: Request) {
  try {
    const userId = await getAuthId();
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await safeJson(req);

    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request", 400);

    const result = await prisma.ingredient.deleteMany({
      where: {
        id: parsed.data.id,
        userId,
      },
    });

    // result.count is how many rows were deleted (0 if id wasn't found / not owned)
    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (err) {
    console.error("DELETE /api/bar error:", err);
    return jsonError("Server error", 500);
  }
}