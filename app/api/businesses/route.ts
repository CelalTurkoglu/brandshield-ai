import { cookies } from "next/headers";
import { readSession, sessionCookieName } from "@/lib/auth";
import { createBusiness, databaseConfigured, ensureUser, listBusinesses } from "@/lib/db";

export const runtime = "nodejs";

async function currentUser() {
  const cookieStore = await cookies();
  return readSession(cookieStore.get(sessionCookieName)?.value);
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ businesses: [], authenticated: false, databaseConfigured: databaseConfigured() });
  try {
    await ensureUser(user);
    return Response.json({ businesses: await listBusinesses(user.openId), authenticated: true, databaseConfigured: databaseConfigured() });
  } catch {
    return Response.json({ businesses: [], authenticated: true, databaseConfigured: databaseConfigured(), error: "Business storage is not ready yet." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in before adding a business." }, { status: 401 });
  try {
    const body = (await request.json()) as { name?: string; mapsUrl?: string; sikayetvarUrl?: string; instagramUrl?: string; websiteUrl?: string };
    if (!body.name?.trim()) return Response.json({ error: "Business name is required." }, { status: 400 });
    await ensureUser(user);
    const business = await createBusiness(user.openId, { name: body.name.trim(), mapsUrl: body.mapsUrl?.trim() || "", sikayetvarUrl: body.sikayetvarUrl?.trim() || "", instagramUrl: body.instagramUrl?.trim() || "", websiteUrl: body.websiteUrl?.trim() || "" });
    if (!business) return Response.json({ error: "Database is not available." }, { status: 503 });
    return Response.json({ business }, { status: 201 });
  } catch {
    return Response.json({ error: "Business could not be saved." }, { status: 500 });
  }
}
