// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const COOKIE_NAME = "vbg_guest";

export function middleware(req: NextRequest) {
  const existing = req.cookies.get(COOKIE_NAME)?.value;
  if (existing && existing.length > 10) return NextResponse.next();

  const res = NextResponse.next();

  res.cookies.set({
    name: COOKIE_NAME,
    value: randomUUID(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // localhost must be false
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|map)).*)"],
};