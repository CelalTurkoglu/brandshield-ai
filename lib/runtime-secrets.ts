import { getIntegrationSetting } from "./db";

/**
 * Server-only resolution for integration credentials.
 *
 * Order: process environment (platform secrets / local .env) first, then the private
 * `brandshield_settings` table in the managed database. Values are never sent to the
 * browser; API routes only expose booleans such as `apifyConfigured`.
 */
export const INTEGRATION_SETTING_KEYS = ["APIFY_API_TOKEN", "FAL_KEY", "FAL_MODEL"] as const;
export type IntegrationSettingKey = (typeof INTEGRATION_SETTING_KEYS)[number];

const CACHE_TTL_MS = 60_000;
const cache = new Map<IntegrationSettingKey, { value: string; at: number }>();

export async function readIntegrationSecret(name: IntegrationSettingKey): Promise<string> {
  const fromEnv = process.env[name];
  if (fromEnv) return fromEnv;
  const cached = cache.get(name);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;
  let value = "";
  try {
    value = (await getIntegrationSetting(name)) ?? "";
  } catch {
    value = cached?.value ?? "";
  }
  cache.set(name, { value, at: Date.now() });
  return value;
}
