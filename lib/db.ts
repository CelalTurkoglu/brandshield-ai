import crypto from "node:crypto";
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import type { AuthUser } from "./auth";
import type { Business, Review } from "./types";

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = mysql.createPool({ uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 5, maxIdle: 5, idleTimeout: 60000 });
  return pool;
}

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export type StoredAuthUser = AuthUser & { passwordHash: string };

export async function findUserByEmail(email: string): Promise<StoredAuthUser | null> {
  const db = getPool();
  if (!db) return null;
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT open_id, name, email, password_hash FROM brandshield_users WHERE email = ? LIMIT 1`, [email]);
  const row = rows[0];
  if (!row) return null;
  return { openId: String(row.open_id), name: String(row.name), email: String(row.email), passwordHash: row.password_hash ? String(row.password_hash) : "" };
}

export async function createLocalUser(input: { name: string; email: string; passwordHash: string }): Promise<AuthUser> {
  const db = getPool();
  if (!db) throw new Error("Database is not available.");
  const openId = `local_${crypto.randomUUID()}`;
  await db.execute(`INSERT INTO brandshield_users (open_id, name, email, password_hash) VALUES (?, ?, ?, ?)`, [openId, input.name.trim(), input.email, input.passwordHash]);
  return { openId, name: input.name.trim(), email: input.email };
}

export async function ensureUser(user: AuthUser) {
  const db = getPool();
  if (!db) return;
  await db.execute(
    `INSERT INTO brandshield_users (open_id, name, email) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email)`,
    [user.openId, user.name, user.email],
  );
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160) || "business";
}

export async function listBusinesses(ownerOpenId: string): Promise<Business[]> {
  const db = getPool();
  if (!db) return [];
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT id, name, slug, maps_url, sikayetvar_url, instagram_url, website_url, created_at, updated_at FROM brandshield_businesses WHERE owner_open_id = ? ORDER BY updated_at DESC`, [ownerOpenId]);
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    mapsUrl: row.maps_url ? String(row.maps_url) : "",
    sikayetvarUrl: row.sikayetvar_url ? String(row.sikayetvar_url) : "",
    instagramUrl: row.instagram_url ? String(row.instagram_url) : "",
    websiteUrl: row.website_url ? String(row.website_url) : "",
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

export async function createBusiness(ownerOpenId: string, input: Omit<Business, "id" | "slug" | "createdAt" | "updatedAt">): Promise<Business | null> {
  const db = getPool();
  if (!db) return null;
  const baseSlug = slugify(input.name);
  const [result] = await db.execute<ResultSetHeader>(`INSERT INTO brandshield_businesses (owner_open_id, name, slug, maps_url, sikayetvar_url, instagram_url, website_url) VALUES (?, ?, ?, ?, ?, ?, ?)`, [ownerOpenId, input.name.trim(), `${baseSlug}-${Date.now().toString(36)}`, input.mapsUrl || null, input.sikayetvarUrl || null, input.instagramUrl || null, input.websiteUrl || null]);
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT id, name, slug, maps_url, sikayetvar_url, instagram_url, website_url, created_at, updated_at FROM brandshield_businesses WHERE id = ? AND owner_open_id = ?`, [result.insertId, ownerOpenId]);
  const row = rows[0];
  if (!row) return null;
  return { id: String(row.id), name: String(row.name), slug: String(row.slug), mapsUrl: row.maps_url ? String(row.maps_url) : "", sikayetvarUrl: row.sikayetvar_url ? String(row.sikayetvar_url) : "", instagramUrl: row.instagram_url ? String(row.instagram_url) : "", websiteUrl: row.website_url ? String(row.website_url) : "", createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString() };
}

export async function persistReviews(businessId: string, reviews: Review[]) {
  const db = getPool();
  if (!db || !reviews.length) return;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const review of reviews.slice(0, 100)) {
      await connection.execute(
        `INSERT INTO brandshield_reviews (business_id, external_id, author, rating, review_text, review_date, source, sentiment, category, topics) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE author = VALUES(author), rating = VALUES(rating), review_text = VALUES(review_text), review_date = VALUES(review_date), sentiment = VALUES(sentiment), category = VALUES(category), topics = VALUES(topics)`,
        [businessId, review.id, review.author, review.rating, review.text, review.date, review.source, review.sentiment || null, review.category || null, JSON.stringify(review.topics || [])],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateBusiness(ownerOpenId: string, businessId: string, input: Partial<Pick<Business, "name" | "mapsUrl" | "sikayetvarUrl" | "instagramUrl" | "websiteUrl">>) {
  const db = getPool();
  if (!db) return false;
  const fields: string[] = [];
  const values: string[] = [];
  const mapping: Array<[keyof typeof input, string]> = [["name", "name"], ["mapsUrl", "maps_url"], ["sikayetvarUrl", "sikayetvar_url"], ["instagramUrl", "instagram_url"], ["websiteUrl", "website_url"]];
  for (const [key, column] of mapping) {
    if (typeof input[key] === "string") { fields.push(`${column} = ?`); values.push(input[key] as string); }
  }
  if (!fields.length) return true;
  values.push(businessId, ownerOpenId);
  await db.execute(`UPDATE brandshield_businesses SET ${fields.join(", ")} WHERE id = ? AND owner_open_id = ?`, values);
  return true;
}

export async function deleteBusiness(ownerOpenId: string, businessId: string) {
  const db = getPool();
  if (!db) return false;
  await db.execute(`DELETE FROM brandshield_businesses WHERE id = ? AND owner_open_id = ?`, [businessId, ownerOpenId]);
  return true;
}
