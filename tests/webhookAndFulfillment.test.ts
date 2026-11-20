import { describe, it, expect } from "vitest";
import { redactPII } from "@/lib/logger";
import { siteUrl } from "@/lib/siteUrl";
import { canTransition } from "@/lib/orderStatus";

describe("Webhook, Fulfillment & Security Redaction", () => {
  describe("PII Redaction Helper", () => {
    it("should mask email addresses in log strings", () => {
      const input = "User created with email customer.secret@gmail.com and id 123";
      const redacted = redactPII(input);
      expect(redacted).not.toContain("customer.secret@gmail.com");
      expect(redacted).toContain("cu***@gmail.com");
    });

    it("should mask Indonesian phone numbers in log strings", () => {
      const input = "Buyer phone number is 081234567890 for invoice INV-1";
      const redacted = redactPII(input);
      expect(redacted).not.toContain("081234567890");
      expect(redacted).toContain("0812***90");
    });

    it("should mask sensitive keys in objects", () => {
      const obj = {
        adminToken: "secret_token_12345",
        password: "superPassword!",
        email: "boss@xyzpedia.com",
      };
      const redacted = redactPII(obj);
      expect(redacted.adminToken).toBe("••••••••");
      expect(redacted.password).toBe("••••••••");
      expect(redacted.email).toContain("bo***@xyzpedia.com");
    });
  });

  describe("Site URL Generator", () => {
    it("should return clean site url with path", () => {
      const url = siteUrl("/api/webhooks/qiospay");
      expect(url.endsWith("/api/webhooks/qiospay")).toBe(true);
      expect(url.startsWith("http")).toBe(true);
    });

    it("should handle paths without leading slash", () => {
      const url = siteUrl("transaksi/INV-123");
      expect(url.endsWith("/transaksi/INV-123")).toBe(true);
    });
  });

  describe("Fulfillment State Machine Transitions", () => {
    it("should allow transition from PAID to SUCCESS or FAILED", () => {
      expect(canTransition("PAID", "SUCCESS")).toBe(true);
      expect(canTransition("PAID", "FAILED")).toBe(true);
      expect(canTransition("PAID", "PROCESSING")).toBe(true);
    });

    it("should forbid illegal transitions from SUCCESS or REFUNDED", () => {
      expect(canTransition("SUCCESS", "PENDING")).toBe(false);
      expect(canTransition("SUCCESS", "PAID")).toBe(false);
      expect(canTransition("REFUNDED", "PAID")).toBe(false);
    });

    it("should allow transition from FAILED to REFUNDED", () => {
      expect(canTransition("FAILED", "REFUNDED")).toBe(true);
    });
  });
});
