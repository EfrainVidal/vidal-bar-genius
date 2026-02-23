import "server-only";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { assertEnv } from "@/lib/env.server";

/**
 * Minimal email auth (no paid provider):
 * - Request login => email magic link with token
 * - Verify token => set httpOnly signed session cookie
 *
 * Security notes:
 * - Token stored as SHA256 hash (never store raw token)
 * - Token expires
 * - Cookie is httpOnly + signed (HMAC)
 */

const COOKIE_NAME = "vbg_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function hmac(data: string) {
  const secret = assertEnv("AUTH_SECRET");
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

function sha256(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [userId, sig] = raw.split(".");
  if (!userId || !sig) return null;

  const expected = hmac(userId);

  if (sig.length !== expected.length) return null;

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  return userId;
}

export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not logged in");
  return userId;
}

export async function startEmailLogin(emailRaw: string) {
  const email = (emailRaw || "").trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Enter a valid email.");

  // Generate token and store hash
  const token = crypto.randomBytes(24).toString("hex"); // 48 chars
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // ✅ headers() is async in App Router
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const ua = h.get("user-agent") || null;

  await prisma.loginToken.create({
    data: { email, tokenHash, expiresAt, ip, ua },
  });

  const appUrl = assertEnv("APP_URL");
  const url = `${appUrl}/api/auth/verify?token=${token}`;

  await sendLoginEmail(email, url);

  return { ok: true };
}

async function sendLoginEmail(to: string, url: string) {
  const host = assertEnv("SMTP_HOST");
  const port = Number(assertEnv("SMTP_PORT"));
  const user = assertEnv("SMTP_USER");
  const pass = assertEnv("SMTP_PASS");
  const from = assertEnv("SMTP_FROM");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: { user, pass },
  });

  const subject = "Your Vidal Bar Genius sign-in link";
  const text =
    `Use this link to sign in (valid for 15 minutes):\n\n${url}\n\n` +
    `If you didn’t request this, you can ignore this email.`;

  await transporter.sendMail({ from, to, subject, text });
}

export async function verifyEmailLoginToken(tokenRaw: string) {
  const token = (tokenRaw || "").trim();
  if (!token) throw new Error("Missing token.");

  const tokenHash = sha256(token);

  const row = await prisma.loginToken.findUnique({ where: { tokenHash } });
  if (!row) throw new Error("Invalid or expired link.");
  if (row.usedAt) throw new Error("This link was already used.");
  if (row.expiresAt.getTime() < Date.now()) throw new Error("This link expired.");

  // Mark token used
  await prisma.loginToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });

  // Use email as stable identity (no paid auth provider)
  const userId = row.email;

  await prisma.user.upsert({
    where: { id: userId },
    update: { email: row.email, lastSeenAt: new Date() },
    create: { id: userId, email: row.email, lastSeenAt: new Date() },
  });

  // Set signed cookie: userId.signature
  const sig = hmac(userId);

  const jar = await cookies();
  jar.set(COOKIE_NAME, `${userId}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}
export async function logout() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
