import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface AdminSessionPayload {
  username: string;
  name: string;
  role: string;
  sid?: string;
  exp: number;
}

const AUTH_COOKIE_NAME = "xyz_admin_session";

function getSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET environment variable is required.");
  }
  return secret;
}

/**
 * Hash password using Node.js crypto.scrypt
 */
export async function hashPasswordScrypt(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verify password against scrypt or legacy SHA-256
 */
export async function verifyPassword(password: string, storedHash: string): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length !== 3) return { valid: false, needsUpgrade: false };
    const salt = parts[1];
    const hash = parts[2];

    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return resolve({ valid: false, needsUpgrade: false });
        const bufA = Buffer.from(hash, "hex");
        const bufB = derivedKey;
        const valid = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
        resolve({ valid, needsUpgrade: false });
      });
    });
  }

  // Legacy SHA-256 fallback (auto-upgrade on success)
  const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
  const bufA = Buffer.from(legacyHash);
  const bufB = Buffer.from(storedHash);
  if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
    return { valid: true, needsUpgrade: true };
  }

  return { valid: false, needsUpgrade: false };
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
 * Get current admin session from server cookies, verifying active session state
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyAdminToken(token);
    if (!payload) return null;

    // If session id exists, verify not revoked in DB
    if (payload.sid) {
      try {
        const session = await (prisma as any).adminSession.findUnique({
          where: { id: payload.sid },
        });
        if (!session || session.revokedAt || new Date() > session.expiresAt) {
          return null;
        }
      } catch {
        // Fallback to token payload if AdminSession table not yet migrated
      }
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Revoke session on logout
 */
export async function revokeAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return;
    const payload = verifyAdminToken(token);
    if (payload?.sid) {
      try {
        await (prisma as any).adminSession.update({
          where: { id: payload.sid },
          data: { revokedAt: new Date() },
        });
      } catch {
        // Ignore if model does not exist
      }
    }
  } catch {
    // Ignore
  }
}

export function canAdminMutate(session: Pick<AdminSessionPayload, "role"> | null | undefined): boolean {
  return Boolean(session && (session.role === "OWNER" || session.role === "ADMIN"));
}

export function isOwnerRole(session: Pick<AdminSessionPayload, "role"> | null | undefined): boolean {
  return Boolean(session && session.role === "OWNER");
}

/**
 * Verify admin credentials against environment variables or database.
 * Uses timing-safe comparison to prevent timing attacks on master password.
 */
export async function verifyAdminCredentials(username: string, pass: string): Promise<{ valid: boolean; role: string; name: string } | null> {
  const masterUsername = process.env.ADMIN_USERNAME;
  const masterPassword = process.env.ADMIN_PASSWORD;

  // Check master credentials with timing-safe comparison -> OWNER role
  if (masterUsername && masterPassword && username === masterUsername) {
    const bufA = Buffer.from(pass);
    const bufB = Buffer.from(masterPassword);
    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return { valid: true, role: "OWNER", name: "Master Admin" };
    }
    return null;
  }

  // Check database Admin table with Prisma
  try {
    const dbAdmin = await prisma.admin.findUnique({
      where: { username },
    });
    if (dbAdmin) {
      const { valid, needsUpgrade } = await verifyPassword(pass, dbAdmin.password);
      if (valid) {
        if (needsUpgrade) {
          try {
            const newHash = await hashPasswordScrypt(pass);
            await prisma.admin.update({
              where: { id: dbAdmin.id },
              data: { password: newHash },
            });
          } catch {
            // Non-fatal if upgrade write fails
          }
        }
        return {
          valid: true,
          role: dbAdmin.role || "ADMIN",
          name: dbAdmin.name,
        };
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export { AUTH_COOKIE_NAME };
