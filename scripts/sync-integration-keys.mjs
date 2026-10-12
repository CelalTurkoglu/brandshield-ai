// Copies integration credentials from the local .env into the private brandshield_settings
// table of the managed database, so the published server can read them without exposing
// them to Git, the Docker image or the browser. Values are never printed.
//
// Usage: pnpm integrations:sync
import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const KEYS = ["APIFY_API_TOKEN", "FAL_KEY", "FAL_MODEL"];
const url = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL;
if (!url) {
  console.error("DATABASE_URL or MYSQL_URL is not configured.");
  process.exit(1);
}

function parseEnv(text) {
  const values = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

const env = parseEnv(await fs.readFile(new URL("../.env", import.meta.url), "utf8"));
const connection = await mysql.createConnection(url);
try {
  for (const key of KEYS) {
    const value = env[key] ?? "";
    if (!value) {
      console.log(`${key}: skipped (empty in .env)`);
      continue;
    }
    await connection.execute(
      "INSERT INTO brandshield_settings (setting_name, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      [key, value],
    );
    console.log(`${key}: stored (length ${value.length})`);
  }
} finally {
  await connection.end();
}
