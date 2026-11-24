import { describe, it, expect } from "vitest";
import { validateCoupon } from "../src/lib/couponHelper";
import { checkRateLimit } from "../src/lib/rateLimit";

describe("Fase 4: Coupon Validation & Rate Limiter", () => {
  it("should calculate legacy coupons with supplier price protection", async () => {
    // XYZPEDIA: 30% up to 1500
    const res1 = await validateCoupon("XYZPEDIA", 10000, 7000);
    expect(res1.valid).toBe(true);
    expect(res1.discountAmount).toBe(1500);

    // Safeguard: supplierPrice is 9000, price is 10000 -> max discount is 1000
    const resProtected = await validateCoupon("XYZPEDIA", 10000, 9500);
    expect(resProtected.valid).toBe(true);
    expect(resProtected.discountAmount).toBe(500);

    // Invalid coupon
    const resInvalid = await validateCoupon("UNKNOWNCOUPON", 10000, 5000);
    expect(resInvalid.valid).toBe(false);
  });

  it("should validate product-scoped coupons properly", async () => {
    const { prisma } = await import("../src/lib/prisma");
    const testCode = `TESTPROD_${Date.now()}`;

    // Create a coupon restricted to "spotify" only
    await prisma.coupon.create({
      data: {
        code: testCode,
        type: "fixed",
        value: 3000,
        applicableProducts: JSON.stringify(["spotify"]),
        active: true,
      },
    });

    try {
      // 1. Used on wrong product ("mobile-legends") -> should be rejected
      const resWrong = await validateCoupon(testCode, 20000, 10000, "mobile-legends");
      expect(resWrong.valid).toBe(false);
      expect(resWrong.message).toContain("tidak berlaku untuk produk");

      // 2. Used on matching product ("spotify") -> should be valid
      const resRight = await validateCoupon(testCode, 20000, 10000, "spotify");
      expect(resRight.valid).toBe(true);
      expect(resRight.discountAmount).toBe(3000);
    } finally {
      await prisma.coupon.delete({ where: { code: testCode } }).catch(() => {});
    }
  });

  it("should validate variant-specific coupons (SKU scoped) properly", async () => {
    const { prisma } = await import("../src/lib/prisma");
    const testSkuCode = `TESTSKU_${Date.now()}`;
    const targetSku = "XAV-NETFLIX-1U1P";

    // Create a coupon restricted to variant targetSku only
    await prisma.coupon.create({
      data: {
        code: testSkuCode,
        type: "fixed",
        value: 5000,
        applicableProducts: JSON.stringify([`SKU:${targetSku}`]),
        active: true,
      },
    });

    try {
      // 1. Used on same product ("netflix") but DIFFERENT variant SKU -> should be rejected
      const resDiffVariant = await validateCoupon(
        testSkuCode,
        35000,
        25000,
        "netflix",
        "XAV-NETFLIX-SEMIPRIVAT"
      );
      expect(resDiffVariant.valid).toBe(false);
      expect(resDiffVariant.message).toContain("tidak berlaku untuk produk atau varian");

      // 2. Used on matching variant SKU -> should be valid
      const resMatchVariant = await validateCoupon(
        testSkuCode,
        30000,
        20000,
        "netflix",
        targetSku
      );
      expect(resMatchVariant.valid).toBe(true);
      expect(resMatchVariant.discountAmount).toBe(5000);
    } finally {
      await prisma.coupon.delete({ where: { code: testSkuCode } }).catch(() => {});
    }
  });

  it("should enforce rate limiting correctly", () => {
    const testKey = `test-ip-${Date.now()}`;
    const rl1 = checkRateLimit(testKey, { intervalMs: 10000, max: 2 });
    expect(rl1.success).toBe(true);

    const rl2 = checkRateLimit(testKey, { intervalMs: 10000, max: 2 });
    expect(rl2.success).toBe(true);

    const rl3 = checkRateLimit(testKey, { intervalMs: 10000, max: 2 });
    expect(rl3.success).toBe(false);
    expect(rl3.remaining).toBe(0);
  });
});
