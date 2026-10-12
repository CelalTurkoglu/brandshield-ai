import { NextResponse } from "next/server";
import { sessionCookieName, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", { ...sessionCookieOptions(request), maxAge: 0 });
  return response;
}
