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
