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
  supplierPrice: number = 0,
  productSlugOrId?: string | null,
  variantSkuOrId?: string | null
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

    if (dbCoupon) {
      if (!dbCoupon.active) {
        return { valid: false, discountAmount: 0, message: "Kupon ini sedang dinonaktifkan atau tidak berlaku." };
      }

      const now = new Date();
      if (dbCoupon.startsAt && now < dbCoupon.startsAt) {
        return { valid: false, discountAmount: 0, message: "Kupon promo belum mulai berlaku." };
      }
      if (dbCoupon.endsAt && now > dbCoupon.endsAt) {
        return { valid: false, discountAmount: 0, message: "Kupon promo telah kedaluwarsa dan tidak berlaku lagi." };
      }
      if (dbCoupon.minSpend && itemPrice < dbCoupon.minSpend) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Minimal belanja Rp ${dbCoupon.minSpend.toLocaleString("id-ID")} untuk kupon ini`,
        };
      }

      // Check product and variant restriction if configured
      if (dbCoupon.applicableProducts && dbCoupon.applicableProducts !== "ALL") {
        let allowedList: string[] = [];
        try {
          allowedList = JSON.parse(dbCoupon.applicableProducts);
        } catch {
          allowedList = dbCoupon.applicableProducts.split(",").map((s: string) => s.trim());
        }

        if (Array.isArray(allowedList) && allowedList.length > 0) {
          const currentProd = String(productSlugOrId || "").trim().toLowerCase();
          const currentSku = String(variantSkuOrId || "").trim().toLowerCase();

          const isAllowed = allowedList.some((item) => {
            const raw = String(item).trim().toLowerCase();

            // 1. Check specific variant SKU (SKU:code)
            if (raw.startsWith("sku:")) {
              const targetSku = raw.replace("sku:", "").trim();
              return currentSku && currentSku === targetSku;
            }

            // 2. Check full product (PROD:slug or bare slug)
            const targetProd = raw.replace("prod:", "").trim();
            if (currentProd && currentProd === targetProd) {
              return true;
            }

            // 3. Fallback direct match with SKU or Slug
            if (currentSku && currentSku === raw) {
              return true;
            }
            if (currentProd && currentProd === raw) {
              return true;
            }

            return false;
          });

          if (!isAllowed) {
            return {
              valid: false,
              discountAmount: 0,
              message: "Kupon ini tidak berlaku untuk produk atau varian yang Anda pilih",
            };
          }
        }
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

      // Safeguard: final price must never fall below supplier price (minimum 15% floor if supplierPrice not set)
      const effectiveSupplierCost = supplierPrice > 0 ? supplierPrice : Math.ceil(itemPrice * 0.85);
      const maxAllowedDiscount = Math.max(0, itemPrice - effectiveSupplierCost);
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

  const effectiveSupplierCost = supplierPrice > 0 ? supplierPrice : Math.ceil(itemPrice * 0.85);
  const maxAllowedDiscount = Math.max(0, itemPrice - effectiveSupplierCost);
  discountAmount = Math.min(discountAmount, maxAllowedDiscount);

  if (discountAmount > 0) {
    return { valid: true, code: cleanPromo, discountAmount };
  }

  return { valid: false, discountAmount: 0, message: "Kode kupon tidak valid atau tidak memenuhi syarat" };
}
