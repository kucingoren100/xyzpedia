import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/couponHelper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, itemPrice, supplierPrice } = body;

    if (!code || typeof itemPrice !== "number") {
      return NextResponse.json(
        { valid: false, discountAmount: 0, message: "Parameter tidak lengkap." },
        { status: 400 }
      );
    }

    const res = await validateCoupon(code, itemPrice, supplierPrice || 0);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, discountAmount: 0, message: "Gagal memvalidasi kupon: " + error.message },
      { status: 500 }
    );
  }
}
