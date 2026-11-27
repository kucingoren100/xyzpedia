import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOrderUpdateMany = vi.fn();
const mockOrderFindUniqueOrThrow = vi.fn();
const mockOrderUpdate = vi.fn();
const mockStockFindFirst = vi.fn();
const mockStockUpdateMany = vi.fn();
const mockStockCount = vi.fn();
const mockItemUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      updateMany: (...args: unknown[]) => mockOrderUpdateMany(...args),
      findUniqueOrThrow: (...args: unknown[]) => mockOrderFindUniqueOrThrow(...args),
      update: (...args: unknown[]) => mockOrderUpdate(...args),
    },
    accountStock: {
      findFirst: (...args: unknown[]) => mockStockFindFirst(...args),
      updateMany: (...args: unknown[]) => mockStockUpdateMany(...args),
      count: (...args: unknown[]) => mockStockCount(...args),
    },
    productItem: {
      update: (...args: unknown[]) => mockItemUpdate(...args),
    },
  },
}));

vi.mock("@/lib/notifications", () => ({
  dispatchNotificationEvent: vi.fn().mockResolvedValue(undefined),
  sendBuyerReceiptEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/whatsapp", () => ({
  notifyBuyerOrderSuccess: vi.fn().mockResolvedValue(undefined),
}));

import { redactPII } from "@/lib/logger";
import { siteUrl } from "@/lib/siteUrl";
import { canTransition } from "@/lib/orderStatus";
import { startFulfillment } from "@/lib/orderFulfillment";

describe("Webhook, Atomic Vault Fulfillment & Security Redaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PII Redaction Helper", () => {
    it("masks email addresses in log strings", () => {
      const input = "User created with email customer.secret@gmail.com and id 123";
      const redacted = redactPII(input);
      expect(redacted).not.toContain("customer.secret@gmail.com");
      expect(redacted).toContain("cu***@gmail.com");
    });

    it("masks Indonesian phone numbers in log strings", () => {
      const input = "Buyer phone number is 081234567890 for invoice INV-1";
      const redacted = redactPII(input);
      expect(redacted).not.toContain("081234567890");
      expect(redacted).toContain("0812***90");
    });

    it("masks sensitive keys in objects", () => {
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
    it("returns clean site url with path", () => {
      const url = siteUrl("/api/webhooks/qiospay");
      expect(url.endsWith("/api/webhooks/qiospay")).toBe(true);
      expect(url.startsWith("http")).toBe(true);
    });

    it("handles paths without leading slash", () => {
      const url = siteUrl("transaksi/INV-123");
      expect(url.endsWith("/transaksi/INV-123")).toBe(true);
    });
  });

  describe("Fulfillment State Machine Transitions", () => {
    it("allows transition from PAID to SUCCESS or FAILED", () => {
      expect(canTransition("PAID", "SUCCESS")).toBe(true);
      expect(canTransition("PAID", "FAILED")).toBe(true);
      expect(canTransition("PAID", "PROCESSING")).toBe(true);
    });

    it("forbids illegal transitions from SUCCESS or REFUNDED", () => {
      expect(canTransition("SUCCESS", "PENDING")).toBe(false);
      expect(canTransition("SUCCESS", "PAID")).toBe(false);
      expect(canTransition("REFUNDED", "PAID")).toBe(false);
    });

    it("allows transition from FAILED to REFUNDED", () => {
      expect(canTransition("FAILED", "REFUNDED")).toBe(true);
    });
  });

  describe("Atomic AccountStock Vault Claim", () => {
    it("retries when first stock row loses optimistic lock race and claims next unused row", async () => {
      mockOrderUpdateMany.mockResolvedValueOnce({ count: 1 });
      mockOrderFindUniqueOrThrow.mockResolvedValueOnce({
        id: "ord_race_1",
        invoiceNumber: "INV-RACE-1",
        productItemId: "item_manual_1",
        totalAmount: 25000,
        paymentMethod: "QRIS",
        targetUserId: "buyer@gmail.com",
        targetZoneId: null,
        customerEmail: "buyer@gmail.com",
        customerPhone: null,
        product: { name: "Spotify Premium", slug: "spotify", categorySlug: "akun-premium" },
        productItem: { id: "item_manual_1", name: "1 Bulan", sku: "MANUAL-SPOTIFY-1M", supplier: "MANUAL" },
      });

      // Attempt 1: stock_1 found, but concurrent buyer already claimed it (count: 0)
      // Attempt 2: stock_2 found, atomic lock succeeds (count: 1)
      mockStockFindFirst
        .mockResolvedValueOnce({ id: "stock_1", credential: "taken@mail.com:pass1" })
        .mockResolvedValueOnce({ id: "stock_2", credential: "winner@mail.com:pass2" });
      mockStockUpdateMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 1 });
      mockStockCount.mockResolvedValueOnce(0);
      mockItemUpdate.mockResolvedValueOnce({});
      mockOrderUpdate.mockResolvedValueOnce({
        id: "ord_race_1",
        invoiceNumber: "INV-RACE-1",
        totalAmount: 25000,
        paymentMethod: "QRIS",
        targetUserId: "buyer@gmail.com",
        targetZoneId: null,
        customerEmail: "buyer@gmail.com",
        customerPhone: null,
        product: { name: "Spotify Premium", slug: "spotify", categorySlug: "akun-premium" },
        productItem: { id: "item_manual_1", name: "1 Bulan", sku: "MANUAL-SPOTIFY-1M", supplier: "MANUAL" },
      });

      const res = await startFulfillment("ord_race_1");
      expect(res.success).toBe(true);
      expect(res.instantStock).toBe(true);
      expect(res.sn).toBe("winner@mail.com:pass2");
      expect(mockStockUpdateMany).toHaveBeenCalledTimes(2);
      expect(mockItemUpdate).toHaveBeenCalledWith({
        where: { id: "item_manual_1" },
        data: { stockStatus: "OUT_OF_STOCK" },
      });
    });
  });
});
