import { authEnvironmentReady } from "@/lib/auth";
import { databaseConfigured } from "@/lib/db";
import { apifyActorId } from "@/lib/integrations";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    apifyConfigured: Boolean(process.env.APIFY_API_TOKEN && apifyActorId()),
    falConfigured: Boolean(process.env.FAL_KEY),
    databaseConfigured: databaseConfigured(),
    authConfigured: authEnvironmentReady(),
    integrations: {
      apifyConfigured: Boolean(process.env.APIFY_API_TOKEN && apifyActorId()),
      falConfigured: Boolean(process.env.FAL_KEY),
      databaseConfigured: databaseConfigured(),
    },
  });
}
