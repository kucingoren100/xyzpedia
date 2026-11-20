import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";
import {
  hashPasswordScrypt,
  verifyPassword,
  signAdminToken,
  verifyAdminToken,
} from "@/lib/adminAuth";

beforeAll(() => {
  process.env.ADMIN_JWT_SECRET = "super-secret-test-jwt-key-xyzpedia-123456789";
});

describe("Admin Authentication Helpers", () => {
  describe("Password Hashing & Verification (scrypt & legacy sha256)", () => {
    it("should hash password with scrypt and successfully verify correct password", async () => {
      const password = "adminSecretPassword123!";
      const hash = await hashPasswordScrypt(password);

      expect(hash.startsWith("scrypt$")).toBe(true);

      const result = await verifyPassword(password, hash);
      expect(result.valid).toBe(true);
      expect(result.needsUpgrade).toBe(false);
    });

    it("should reject incorrect password for scrypt hash", async () => {
      const password = "adminSecretPassword123!";
      const hash = await hashPasswordScrypt(password);

      const result = await verifyPassword("wrongPassword", hash);
      expect(result.valid).toBe(false);
    });

    it("should verify legacy sha256 password and flag for upgrade", async () => {
      const password = "legacyPassword123";
      const legacyHash = crypto.createHash("sha256").update(password).digest("hex");

      const result = await verifyPassword(password, legacyHash);
      expect(result.valid).toBe(true);
      expect(result.needsUpgrade).toBe(true);
    });

    it("should reject incorrect password for legacy sha256 hash", async () => {
      const password = "legacyPassword123";
      const legacyHash = crypto.createHash("sha256").update(password).digest("hex");

      const result = await verifyPassword("wrongLegacyPassword", legacyHash);
      expect(result.valid).toBe(false);
    });
  });

  describe("Admin Session Tokens (HMAC-SHA256)", () => {
    it("should sign and successfully verify a valid admin session token", () => {
      const payload = {
        username: "admin_owner",
        name: "Master Admin",
        role: "OWNER",
      };

      const token = signAdminToken(payload, 2);
      expect(token).toBeDefined();
      expect(token.includes(".")).toBe(true);

      const verified = verifyAdminToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.username).toBe("admin_owner");
      expect(verified?.role).toBe("OWNER");
      expect(verified?.exp).toBeGreaterThan(Date.now());
    });

    it("should reject token with tampered payload or signature", () => {
      const payload = {
        username: "admin_cs",
        name: "Support Staff",
        role: "SUPPORT",
      };

      const token = signAdminToken(payload, 2);
      const [encodedPayload, signature] = token.split(".");

      // Tamper signature
      const tamperedSignature = signature.slice(0, -2) + "ab";
      const tamperedToken = `${encodedPayload}.${tamperedSignature}`;

      expect(verifyAdminToken(tamperedToken)).toBeNull();

      // Tamper payload (e.g. privilege escalation attempt to OWNER)
      const tamperedPayloadObj = { ...payload, role: "OWNER", exp: Date.now() + 100000 };
      const tamperedEncoded = Buffer.from(JSON.stringify(tamperedPayloadObj)).toString("base64url");
      const escalatedToken = `${tamperedEncoded}.${signature}`;

      expect(verifyAdminToken(escalatedToken)).toBeNull();
    });

    it("should reject expired admin tokens", () => {
      const payload = {
        username: "admin_expired",
        name: "Expired Admin",
        role: "ADMIN",
      };

      // Create token expired in the past (-1 hour)
      const token = signAdminToken(payload, -1);
      const verified = verifyAdminToken(token);

      expect(verified).toBeNull();
    });

    it("should reject malformed token strings", () => {
      expect(verifyAdminToken("")).toBeNull();
      expect(verifyAdminToken("just-a-random-string")).toBeNull();
      expect(verifyAdminToken("one.two.three")).toBeNull();
    });
  });
});
