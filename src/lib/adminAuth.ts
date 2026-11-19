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

function getSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_JWT_SECRET environment variable is required in production.");
    }
    return "dev_secret_only_for_local_debugging_purposes";
  }
  return secret;
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
 * Verify admin credentials against environment variables or database.
 * Uses timing-safe comparison to prevent timing attacks on master password.
 */
export async function verifyAdminCredentials(username: string, pass: string): Promise<boolean> {
  const masterUsername = process.env.ADMIN_USERNAME;
  const masterPassword = process.env.ADMIN_PASSWORD;

  // Check master credentials with timing-safe comparison
  if (masterUsername && masterPassword && username === masterUsername) {
    const bufA = Buffer.from(pass);
    const bufB = Buffer.from(masterPassword);
    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return true;
    }
    // Even if length differs, return false (don't short-circuit timing)
    return false;
  }

  // Check database Admin table with Prisma (safe from SQL injection)
  try {
    const dbAdmin = await prisma.admin.findUnique({
      where: { username },
    });
    if (dbAdmin) {
      // Compare sha256 hash
      const hashedInput = crypto.createHash("sha256").update(pass).digest("hex");
      const bufA = Buffer.from(hashedInput);
      const bufB = Buffer.from(dbAdmin.password);
      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        return true;
      }
    }
  } catch {
    // Ignore database lookup error; master credentials only
  }

  return false;
}

export { AUTH_COOKIE_NAME };
