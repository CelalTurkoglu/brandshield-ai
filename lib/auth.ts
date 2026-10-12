import crypto from "node:crypto";
import { promisify } from "node:util";
import { jwtVerify, SignJWT } from "jose";

export const sessionCookieName = "brandshield_session";
export const authReturnCookieName = "brandshield_auth_return";

export interface AuthUser {
  openId: string;
  name: string;
  email: string;
}

const scrypt = promisify(crypto.scrypt);

// BrandShield signs its own email/password sessions. A dedicated BRANDSHIELD_JWT_SECRET wins;
// otherwise the hosting platform's private runtime signing secret is used as the HMAC key.
function sessionSigningSecret() {
  return process.env.BRANDSHIELD_JWT_SECRET || process.env.MANUS_JWT_SECRET || "";
}
function getSecret() {
  const secret = sessionSigningSecret();
  return secret ? new TextEncoder().encode(secret) : null;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validatePassword(password: string) {
  return password.length >= 8 && password.length <= 128;
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [, salt, hash] = encoded.split(":");
  if (!salt || !hash) return false;
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derivedKey.length && crypto.timingSafeEqual(expected, derivedKey);
}

export async function createSession(user: AuthUser) {
  const secret = getSecret();
  if (!secret) throw new Error("BRANDSHIELD_JWT_SECRET is not available.");
  return new SignJWT({ ...user, appId: "brandshield" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function readSession(token?: string): Promise<AuthUser | null> {
  const secret = getSecret();
  if (!secret || !token) return null;
  try {
    const result = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (result.payload.appId !== "brandshield") return null;
    const payload = result.payload;
    if (typeof payload.openId !== "string" || typeof payload.email !== "string") return null;
    return {
      openId: payload.openId,
      name: typeof payload.name === "string" ? payload.name : payload.email.split("@")[0],
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export function authEnvironmentReady() {
  return Boolean(sessionSigningSecret() && process.env.DATABASE_URL);
}

export function sessionCookieOptions(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isHttps = forwardedProto === "https" || new URL(request.url).protocol === "https:";
  return {
    httpOnly: true,
    sameSite: isHttps ? "none" as const : "lax" as const,
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
