// FILE: src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendSupportEmail } from "@/lib/email.server";
import { getSessionUserId } from "@/lib/auth.server";
import { getUserIdOrAnon } from "@/lib/identity.server";

/**
 * POST /api/contact
 * - Accepts { name, email, message }
 * - Creates SupportTicket in Postgres (so nothing is lost)
 * - Attempts to send support email via Gmail SMTP (Nodemailer)
 * - Always returns JSON
 *
 * IMPORTANT:
 * - Do NOT call cookies()/headers() (directly or indirectly) at module scope.
 * - Anything that relies on request scope must happen INSIDE the route handler.
 */

const ContactSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(254),
  message: z.string().min(10).max(4000),
});

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        {
          ok: false,
          error: "Invalid request. Please provide name, a valid email, and a longer message.",
        },
        400
      );
    }

    const { name, email, message } = parsed.data;

    // ✅ Request-scoped identity lookup MUST be inside the handler.
    // These helpers likely use cookies() internally, which only works during a request.
    let userId: string | null = null;
    try {
      const identity = await getUserIdOrAnon(getSessionUserId);
      userId = typeof identity?.userId === "string" ? identity.userId : null;
    } catch {
      // If identity resolution fails for any reason, we still accept support messages.
      userId = null;
    }

    // 1) Store ticket first
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        name,
        email,
        message,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    // 2) Attempt SMTP send (non-blocking UX: we still accept the ticket even if SMTP fails)
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const info = await sendSupportEmail({
        ticketId: ticket.id,
        name,
        email,
        message,
        appUrl: process.env.APP_URL,
      });

      emailSent = info.rejected.length === 0;
      if (!emailSent) {
        emailError = `Email rejected: ${info.rejected.join(", ")}`;
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Unknown email error";
    }

    // 3) Persist send result
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        emailSentAt: emailSent ? new Date() : null,
        emailError,
      },
      select: { id: true },
    });

    return json({
      ok: true,
      ticketId: ticket.id,
      receivedAt: ticket.createdAt.toISOString(),
      emailSent,
    });
  } catch (err) {
    console.error("[contact] fatal error:", err);
    return json(
      {
        ok: false,
        error: "Server error while sending your message. Please try again.",
      },
      500
    );
  }
}