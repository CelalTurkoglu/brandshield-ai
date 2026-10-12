import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const connection = await mysql.createConnection(url);
try {
  const schema = await fs.readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  for (const statement of schema.split(/;\s*(?:\n|$)/).map((item) => item.trim()).filter(Boolean)) {
    try {
      await connection.query(statement);
    } catch (error) {
      const code = error && typeof error === "object" && "errno" in error ? Number(error.errno) : 0;
      if (code !== 1060 && code !== 1061) throw error;
    }
  }
  console.log("BrandShield database schema is ready.");
} finally {
  await connection.end();
}
