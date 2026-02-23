import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccess } from "@/lib/access.server";
import { prisma } from "@/lib/prisma";

/**
 * Helper: get a non-null userId.
 * Returns the string ID if authenticated, or null if not.
 */
async function getAuthId(): Promise<string | null> {
  const access = await getAccess();
  return access?.userId || null;
}

export async function GET() {
  const userId = await getAuthId();

  // This check "narrows" userId from string | null to just string
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { userId }, // ✅ TypeScript now knows this is a string
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ingredients });
}

const AddSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.string().min(2).max(40),
});

export async function POST(req: Request) {
  const userId = await getAuthId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
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
}

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(req: Request) {
  const userId = await getAuthId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = DeleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Use deleteMany to ensure the item actually belongs to the user
  await prisma.ingredient.deleteMany({
    where: { 
      id: parsed.data.id, 
      userId 
    },
  });

  return NextResponse.json({ ok: true });
}