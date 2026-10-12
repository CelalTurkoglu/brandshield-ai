import { NextResponse } from "next/server";
import { authEnvironmentReady, createSession, normalizeEmail, sessionCookieName, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/app?auth=login", request.url));
}

export async function POST(request: Request) {
  if (!authEnvironmentReady()) return Response.json({ error: "Local authentication is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { email?: string; password?: string };
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";
    const stored = await findUserByEmail(email);
    if (!stored || !(await verifyPassword(password, stored.passwordHash))) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
    const user = { openId: stored.openId, name: stored.name, email: stored.email };
    const response = NextResponse.json({ authenticated: true, user });
    response.cookies.set(sessionCookieName, await createSession(user), sessionCookieOptions(request));
    return response;
  } catch {
    return Response.json({ error: "Sign in failed." }, { status: 500 });
  }
}
