import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

/**
 * Helper: Fetches the userId. 
 * Returns the string if found, or null if unauthorized.
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  const access = await getAccess();
  // Ensure we return a real string or a clear null
  return access?.userId || null;
}

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ingredients = await prisma.ingredient.findMany({
    // TypeScript now knows userId is strictly a string here
    where: { userId }, 
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ingredients });
}

const AddSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(40),
});

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = AddSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ingredient", details: parsed.error.format() }, { status: 400 });
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      userId,
      name: parsed.data.name,
      type: parsed.data.type,
    },
  });

  return NextResponse.json({ ingredient });
}

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(req: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = DeleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Use deleteMany to ensure the user can only delete their own items
  const result = await prisma.ingredient.deleteMany({
    where: { 
      id: parsed.data.id, 
      userId 
    },
  });

  return NextResponse.json({ ok: true, deletedCount: result.count });
}