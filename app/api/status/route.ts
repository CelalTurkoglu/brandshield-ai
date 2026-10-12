import { authEnvironmentReady } from "@/lib/auth";
import { databaseConfigured } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    apifyConfigured: Boolean(process.env.APIFY_API_TOKEN && process.env.APIFY_REVIEW_ACTOR_ID),
    falConfigured: Boolean(process.env.FAL_KEY),
    databaseConfigured: databaseConfigured(),
    authConfigured: authEnvironmentReady(),
    integrations: {
      apifyConfigured: Boolean(process.env.APIFY_API_TOKEN && process.env.APIFY_REVIEW_ACTOR_ID),
      falConfigured: Boolean(process.env.FAL_KEY),
      databaseConfigured: databaseConfigured(),
    },
  });
}
