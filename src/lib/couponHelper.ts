// src/lib/couponHelper.ts
import { prisma } from "./prisma";

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountAmount: number;
  message?: string;
}

/**
 * Validate coupon against database rules (enforces active, window, minSpend, product/SKU scope, totalQuota, and perUserQuota)
 */
export async function validateCoupon(
  code: string | undefined | null,
  itemPrice: number,
  supplierPrice: number = 0,
  productSlugOrId?: string | null,
  variantSkuOrId?: string | null,
  customerEmail?: string | null
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0 };
  }

  const cleanPromo = code.trim().toUpperCase();

  try {
    const dbCoupon = await prisma.coupon.findUnique({
      where: { code: cleanPromo },
    });

    if (!dbCoupon) {
      return { valid: false, discountAmount: 0, message: "Kode kupon tidak valid atau tidak ditemukan." };
    }

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

    // Enforce totalQuota & perUserQuota against active/completed orders
    const activeStatuses = ["PENDING", "PAID", "PROCESSING", "SUCCESS"];
    if (typeof dbCoupon.totalQuota === "number") {
      if (dbCoupon.totalQuota <= 0) {
        return { valid: false, discountAmount: 0, message: "Kuota pemakaian kupon ini telah habis." };
      }
      const usedTotal = await prisma.order.count({
        where: {
          couponCode: { equals: cleanPromo, mode: "insensitive" },
          status: { in: activeStatuses },
        },
      });
      if (usedTotal >= dbCoupon.totalQuota) {
        return { valid: false, discountAmount: 0, message: "Kuota pemakaian kupon ini telah habis." };
      }
    }

    if (typeof dbCoupon.perUserQuota === "number" && dbCoupon.perUserQuota > 0 && customerEmail?.trim()) {
      const usedByUser = await prisma.order.count({
        where: {
          couponCode: { equals: cleanPromo, mode: "insensitive" },
          customerEmail: { equals: customerEmail.trim(), mode: "insensitive" },
          status: { in: activeStatuses },
        },
      });
      if (usedByUser >= dbCoupon.perUserQuota) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Anda telah mencapai batas pemakaian kupon ini (${dbCoupon.perUserQuota}x per pengguna).`,
        };
      }
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
          if (raw === "all") return true;
          if (raw.startsWith("sku:")) {
            const targetSku = raw.replace("sku:", "").trim();
            return Boolean(currentSku && currentSku === targetSku);
          }
          const targetProd = raw.replace("prod:", "").trim();
          if (currentProd && currentProd === targetProd) return true;
          if (currentSku && currentSku === raw) return true;
          if (currentProd && currentProd === raw) return true;
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
  } catch {
    return { valid: false, discountAmount: 0, message: "Gagal memvalidasi kode kupon saat ini." };
  }
}
