import { cookies } from "next/headers";
import { readSession, sessionCookieName } from "@/lib/auth";
import { deleteBusiness, updateBusiness } from "@/lib/db";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

async function currentUser() {
  const cookieStore = await cookies();
  return readSession(cookieStore.get(sessionCookieName)?.value);
}

export async function PATCH(request: Request, context: Context) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in before editing a business." }, { status: 401 });
  const { id } = await context.params;
  try {
    const body = await request.json() as { name?: string; mapsUrl?: string; sikayetvarUrl?: string; instagramUrl?: string; websiteUrl?: string };
    const updated = await updateBusiness(user.openId, id, body);
    return updated ? Response.json({ ok: true, id }) : Response.json({ error: "Database is not available." }, { status: 503 });
  } catch {
    return Response.json({ error: "Business could not be updated." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in before deleting a business." }, { status: 401 });
  const { id } = await context.params;
  try {
    const deleted = await deleteBusiness(user.openId, id);
    return deleted ? Response.json({ ok: true, id }) : Response.json({ error: "Database is not available." }, { status: 503 });
  } catch {
    return Response.json({ error: "Business could not be deleted." }, { status: 500 });
  }
}
