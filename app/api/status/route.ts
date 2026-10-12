import { authEnvironmentReady } from "@/lib/auth";
import { databaseConfigured } from "@/lib/db";
import { apifyActorId } from "@/lib/integrations";
import { readIntegrationSecret } from "@/lib/runtime-secrets";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const [apifyToken, falKey] = await Promise.all([readIntegrationSecret("APIFY_API_TOKEN"), readIntegrationSecret("FAL_KEY")]);
  const apifyConfigured = Boolean(apifyToken && apifyActorId());
  const falConfigured = Boolean(falKey);
  const database = databaseConfigured();
  return Response.json({
    apifyConfigured,
    falConfigured,
    databaseConfigured: database,
    authConfigured: authEnvironmentReady(),
    integrations: { apifyConfigured, falConfigured, databaseConfigured: database },
  });
}
