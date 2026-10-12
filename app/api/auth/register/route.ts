import { NextResponse } from "next/server";
import { authEnvironmentReady, createSession, hashPassword, normalizeEmail, sessionCookieName, sessionCookieOptions, validatePassword } from "@/lib/auth";
import { createLocalUser, findUserByEmail } from "@/lib/db";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!authEnvironmentReady()) return Response.json({ error: "Local authentication is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { name?: string; email?: string; password?: string };
    const name = body.name?.trim() || "";
    const email = normalizeEmail(body.email || "");
    const password = body.password || "";
    if (name.length < 2 || name.length > 80) return Response.json({ error: "Please enter your name." }, { status: 400 });
    if (!emailPattern.test(email)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!validatePassword(password)) return Response.json({ error: "Password must be 8–128 characters." }, { status: 400 });
    if (await findUserByEmail(email)) return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    const user = await createLocalUser({ name, email, passwordHash: await hashPassword(password) });
    const response = NextResponse.json({ authenticated: true, user }, { status: 201 });
    response.cookies.set(sessionCookieName, await createSession(user), sessionCookieOptions(request));
    return response;
  } catch {
    return Response.json({ error: "Account could not be created." }, { status: 500 });
  }
}
