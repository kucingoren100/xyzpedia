import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCouponFindUnique = vi.fn();
const mockOrderCount = vi.fn();

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    coupon: {
      findUnique: (...args: unknown[]) => mockCouponFindUnique(...args),
    },
    order: {
      count: (...args: unknown[]) => mockOrderCount(...args),
    },
  },
}));

import { validateCoupon } from "../src/lib/couponHelper";
import { checkRateLimit } from "../src/lib/rateLimit";
import { canAdminMutate, isOwnerRole } from "../src/lib/adminAuth";

describe("Security Helpers: Mocked Coupon Validation, Quotas, Rate Limit & RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderCount.mockResolvedValue(0);
  });

  it("rejects removed hardcoded legacy coupon codes when absent from DB", async () => {
    mockCouponFindUnique.mockResolvedValue(null);

    const resLegacy = await validateCoupon("XYZPEDIA", 10000, 7000);
    expect(resLegacy.valid).toBe(false);
    expect(resLegacy.discountAmount).toBe(0);
  });

  it("enforces supplier price margin protection on DB coupons", async () => {
    mockCouponFindUnique.mockResolvedValue({
      code: "PROMO30",
      type: "percent",
      value: 30,
      maxDiscount: 5000,
      minSpend: null,
      startsAt: null,
      endsAt: null,
      totalQuota: null,
      perUserQuota: null,
      applicableProducts: "ALL",
      active: true,
    });

    // Normal margin: 30% of 10.000 = 3.000 (allowed since supplierPrice 6.000 -> max 4.000)
    const resNormal = await validateCoupon("PROMO30", 10000, 6000);
    expect(resNormal.valid).toBe(true);
    expect(resNormal.discountAmount).toBe(3000);

    // Tight margin: supplierPrice 9.500, itemPrice 10.000 -> maxAllowedDiscount capped at 500
    const resCapped = await validateCoupon("PROMO30", 10000, 9500);
    expect(resCapped.valid).toBe(true);
    expect(resCapped.discountAmount).toBe(500);
  });

  it("enforces totalQuota and perUserQuota limits", async () => {
    mockCouponFindUnique.mockResolvedValue({
      code: "KUOTA10",
      type: "fixed",
      value: 2000,
      maxDiscount: null,
      minSpend: null,
      startsAt: null,
      endsAt: null,
      totalQuota: 10,
      perUserQuota: 1,
      applicableProducts: "ALL",
      active: true,
    });

    // 1. Exhausted totalQuota (10 used out of 10)
    mockOrderCount.mockResolvedValueOnce(10);
    const resTotalExhausted = await validateCoupon("KUOTA10", 20000, 15000, "netflix", undefined, "buyer@test.com");
    expect(resTotalExhausted.valid).toBe(false);
    expect(resTotalExhausted.message).toContain("Kuota pemakaian kupon ini telah habis");

    // 2. Total quota available (4/10), but user already used 1x (perUserQuota = 1)
    mockOrderCount.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    const resUserExhausted = await validateCoupon("KUOTA10", 20000, 15000, "netflix", undefined, "buyer@test.com");
    expect(resUserExhausted.valid).toBe(false);
    expect(resUserExhausted.message).toContain("batas pemakaian kupon");

    // 3. Both totalQuota (4/10) and perUserQuota (0/1) available -> valid
    mockOrderCount.mockResolvedValueOnce(4).mockResolvedValueOnce(0);
    const resOk = await validateCoupon("KUOTA10", 20000, 15000, "netflix", undefined, "fresh@test.com");
    expect(resOk.valid).toBe(true);
    expect(resOk.discountAmount).toBe(2000);
  });

  it("validates product-scoped and SKU-scoped coupons without touching real DB", async () => {
    mockCouponFindUnique.mockResolvedValueOnce({
      code: "SPOTIFYONLY",
      type: "fixed",
      value: 3000,
      applicableProducts: JSON.stringify(["spotify"]),
      active: true,
    });
    const wrongProd = await validateCoupon("SPOTIFYONLY", 20000, 10000, "mobile-legends");
    expect(wrongProd.valid).toBe(false);

    mockCouponFindUnique.mockResolvedValueOnce({
      code: "SPOTIFYONLY",
      type: "fixed",
      value: 3000,
      applicableProducts: JSON.stringify(["spotify"]),
      active: true,
    });
    const rightProd = await validateCoupon("SPOTIFYONLY", 20000, 10000, "spotify");
    expect(rightProd.valid).toBe(true);
    expect(rightProd.discountAmount).toBe(3000);

    // SKU-scoped
    mockCouponFindUnique.mockResolvedValue({
      code: "NETFLIX1U",
      type: "fixed",
      value: 5000,
      applicableProducts: JSON.stringify(["SKU:XAV-NETFLIX-1U1P"]),
      active: true,
    });
    const wrongSku = await validateCoupon("NETFLIX1U", 35000, 25000, "netflix", "XAV-NETFLIX-SHARING");
    expect(wrongSku.valid).toBe(false);

    const rightSku = await validateCoupon("NETFLIX1U", 30000, 20000, "netflix", "XAV-NETFLIX-1U1P");
    expect(rightSku.valid).toBe(true);
    expect(rightSku.discountAmount).toBe(5000);
  });

  it("enforces rate limiting correctly", () => {
    const testKey = `test-ip-${Date.now()}`;
    expect(checkRateLimit(testKey, { intervalMs: 10000, max: 2 }).success).toBe(true);
    expect(checkRateLimit(testKey, { intervalMs: 10000, max: 2 }).success).toBe(true);
    const blocked = checkRateLimit(testKey, { intervalMs: 10000, max: 2 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("enforces Admin RBAC helper permissions", () => {
    expect(canAdminMutate(null)).toBe(false);
    expect(canAdminMutate({ role: "VIEWER" })).toBe(false);
    expect(canAdminMutate({ role: "ADMIN" })).toBe(true);
    expect(canAdminMutate({ role: "OWNER" })).toBe(true);

    expect(isOwnerRole({ role: "ADMIN" })).toBe(false);
    expect(isOwnerRole({ role: "OWNER" })).toBe(true);
  });
});
