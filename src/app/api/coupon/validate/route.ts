import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/couponHelper";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  itemPrice: z.number().nonnegative(),
  supplierPrice: z.number().nonnegative().optional(),
  productSlug: z.string().trim().max(100).optional().nullable(),
  productId: z.string().trim().max(100).optional().nullable(),
  variantSku: z.string().trim().max(100).optional().nullable(),
  sku: z.string().trim().max(100).optional().nullable(),
  customerEmail: z.string().trim().max(120).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`coupon-validate:${clientIp}`, {
      intervalMs: 60_000,
      max: 25,
    });
    if (!rl.success) {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Terlalu banyak percobaan kupon. Silakan tunggu sebentar." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = validateCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Parameter tidak lengkap." },
        { status: 400 }
      );
    }

    const { code, itemPrice, supplierPrice, productSlug, productId, variantSku, sku, customerEmail } =
      parsed.data;

    const res = await validateCoupon(
      code,
      itemPrice,
      supplierPrice || 0,
      productSlug || productId || null,
      variantSku || sku || null,
      customerEmail || null
    );
    return NextResponse.json(res);
  } catch {
    return NextResponse.json(
      { valid: false, discountAmount: 0, message: "Gagal memvalidasi kupon." },
      { status: 500 }
    );
  }
}
