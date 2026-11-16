import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface AdminSessionPayload {
  username: string;
  name: string;
  role: string;
  exp: number;
}

const AUTH_COOKIE_NAME = "xyz_admin_session";
const FALLBACK_SECRET = "xyzpedia_super_secret_admin_token_key_2026";

function getSecret(): string {
  return process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET || FALLBACK_SECRET;
}

/**
 * Sign an admin payload with HMAC-SHA256
 */
export function signAdminToken(payload: Omit<AdminSessionPayload, "exp">, expiresInHours = 24): string {
  const fullPayload: AdminSessionPayload = {
    ...payload,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify and decode an admin token
 */
export function verifyAdminToken(token: string): AdminSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(encodedPayload)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Get current admin session from server cookies
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

/**
 * Verify admin credentials against environment variables or database
 */
export async function verifyAdminCredentials(username: string, pass: string): Promise<boolean> {
  const masterUsername = process.env.ADMIN_USERNAME || "admin";
  const masterPassword = process.env.ADMIN_PASSWORD || "admin123";

  // Check master credentials
  if (username === masterUsername && pass === masterPassword) {
    return true;
  }

  // Check database Admin table if exists
  try {
    const admins = await prisma.$queryRawUnsafe<any[]>(
      'SELECT * FROM "Admin" WHERE username = ? LIMIT 1',
      username
    );
    if (admins && admins.length > 0) {
      const dbAdmin = admins[0];
      // Compare plain or sha256
      const hashedInput = crypto.createHash("sha256").update(pass).digest("hex");
      if (dbAdmin.password === pass || dbAdmin.password === hashedInput) {
        return true;
      }
    }
  } catch {
    // Ignore database lookup error and rely on master credentials
  }

  return false;
}

export { AUTH_COOKIE_NAME };
