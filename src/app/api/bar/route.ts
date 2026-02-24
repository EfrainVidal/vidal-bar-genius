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
 * GUEST MODE:
 * - Logged-in users store rows under userId
 * - Logged-out users store rows under guestId (cookie)
 *
 * Goals:
 * 1) Always return JSON (even on errors) so the client never crashes on res.json()
 * 2) Never call Prisma without an owner (userId or guestId)
 * 3) Validate inputs with zod
 */

/** Standard JSON error response helper */
function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Owner resolver:
 * - If logged in -> { userId }
 * - Else -> { guestId }
 *
 * NOTE: In our getAccess(), guestId is ALWAYS present (cookie auto-created).
 */
type Owner =
  | { kind: "user"; userId: string }
  | { kind: "guest"; guestId: string };

async function getOwner(): Promise<Owner> {
  try {
    const access = await getAccess();

    // Logged in
    if (typeof access.userId === "string" && access.userId.trim().length > 0) {
      return { kind: "user", userId: access.userId };
    }

    // Guest mode (always available)
    if (typeof access.guestId === "string" && access.guestId.trim().length > 0) {
      return { kind: "guest", guestId: access.guestId };
    }

    // Should never happen if getAccess() always creates guestId
    throw new Error("Missing owner (no userId and no guestId)");
  } catch (err) {
    console.error("getOwner() failed in /api/bar:", err);
    // Return a consistent JSON error upstream
    throw err;
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
 * Returns ingredients for the current owner (user or guest).
 */
export async function GET() {
  try {
    const owner = await getOwner();

    const ingredients = await prisma.ingredient.findMany({
      where: owner.kind === "user" ? { userId: owner.userId } : { guestId: owner.guestId },
      orderBy: { createdAt: "desc" },
    });

    // owner is returned only for debugging/telemetry; safe to remove later
    return NextResponse.json({ ok: true, ingredients, owner: owner.kind });
  } catch (err) {
    console.error("GET /api/bar error:", err);
    return jsonError("Server error", 500);
  }
}

/**
 * POST /api/bar
 * Adds a new ingredient for the current owner (user or guest).
 */
export async function POST(req: Request) {
  try {
    const owner = await getOwner();

    const body = await safeJson(req);
    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid ingredient", 400);

    const ingredient = await prisma.ingredient.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type,

        // ✅ Attach ownership correctly
        ...(owner.kind === "user" ? { userId: owner.userId } : { guestId: owner.guestId }),
      },
    });

    return NextResponse.json({ ok: true, ingredient, owner: owner.kind });
  } catch (err: any) {
    console.error("POST /api/bar error:", err);

    /**
     * If you enabled @@unique([userId, name, type]) / @@unique([guestId, name, type]),
     * Prisma will throw on duplicates. Handle gracefully.
     */
    const msg =
      typeof err?.code === "string" && err.code === "P2002"
        ? "You already added that."
        : "Server error";

    return jsonError(msg, 500);
  }
}

/**
 * DELETE /api/bar
 * Deletes an ingredient only if it belongs to the current owner.
 * Uses deleteMany for safety.
 */
export async function DELETE(req: Request) {
  try {
    const owner = await getOwner();

    const body = await safeJson(req);
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid request", 400);

    const result = await prisma.ingredient.deleteMany({
      where: {
        id: parsed.data.id,

        // ✅ Ensure owner matches (prevents deleting someone else's row)
        ...(owner.kind === "user" ? { userId: owner.userId } : { guestId: owner.guestId }),
      },
    });

    return NextResponse.json({ ok: true, deleted: result.count, owner: owner.kind });
  } catch (err) {
    console.error("DELETE /api/bar error:", err);
    return jsonError("Server error", 500);
  }
}