import { cookies } from "next/headers";
import { authEnvironmentReady, readSession, sessionCookieName } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const available = authEnvironmentReady();
  if (!available) return Response.json({ authenticated: false, available: false });
  const cookieStore = await cookies();
  const user = await readSession(cookieStore.get(sessionCookieName)?.value);
  return user ? Response.json({ authenticated: true, available: true, user }) : Response.json({ authenticated: false, available: true }, { status: 401 });
}
