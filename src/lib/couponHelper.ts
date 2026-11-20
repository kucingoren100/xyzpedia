// src/lib/couponHelper.ts
import { prisma } from "./prisma";

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountAmount: number;
  message?: string;
}

/**
 * Validate coupon against database rules or legacy hardcoded codes as fallback
 */
export async function validateCoupon(
  code: string | undefined | null,
  itemPrice: number,
  supplierPrice: number = 0
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0 };
  }

  const cleanPromo = code.trim().toUpperCase();

  // 1. Check database Coupon table if model exists
  try {
    const dbCoupon = await (prisma as any).coupon.findUnique({
      where: { code: cleanPromo },
    });

    if (dbCoupon && dbCoupon.active) {
      const now = new Date();
      if (dbCoupon.startsAt && now < dbCoupon.startsAt) {
        return { valid: false, discountAmount: 0, message: "Kupon belum dapat digunakan" };
      }
      if (dbCoupon.endsAt && now > dbCoupon.endsAt) {
        return { valid: false, discountAmount: 0, message: "Kupon telah kedaluwarsa" };
      }
      if (dbCoupon.minSpend && itemPrice < dbCoupon.minSpend) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Minimal belanja Rp ${dbCoupon.minSpend.toLocaleString("id-ID")} untuk kupon ini`,
        };
      }

      let discount = 0;
      if (dbCoupon.type === "percent") {
        discount = Math.round(itemPrice * (dbCoupon.value / 100));
        if (dbCoupon.maxDiscount && discount > dbCoupon.maxDiscount) {
          discount = dbCoupon.maxDiscount;
        }
      } else {
        discount = dbCoupon.value;
      }

      // Safeguard: final price must never fall below supplier price
      const maxAllowedDiscount = Math.max(0, itemPrice - supplierPrice);
      discount = Math.min(discount, maxAllowedDiscount);

      return { valid: true, code: cleanPromo, discountAmount: discount };
    }
  } catch {
    // Fallback if table not ready
  }

  // 2. Legacy coupons fallback with supplier price protection
  let discountAmount = 0;
  if (cleanPromo === "XYZPEDIA") {
    discountAmount = Math.min(1500, Math.floor(itemPrice * 0.3));
  } else if (cleanPromo === "HEMAT5") {
    discountAmount = Math.min(5000, Math.round(itemPrice * 0.05));
  } else if (cleanPromo === "NEWUSER" && itemPrice >= 10000) {
    discountAmount = 2000;
  }

  const maxAllowedDiscount = Math.max(0, itemPrice - supplierPrice);
  discountAmount = Math.min(discountAmount, maxAllowedDiscount);

  if (discountAmount > 0) {
    return { valid: true, code: cleanPromo, discountAmount };
  }

  return { valid: false, discountAmount: 0, message: "Kode kupon tidak valid atau tidak memenuhi syarat" };
}
