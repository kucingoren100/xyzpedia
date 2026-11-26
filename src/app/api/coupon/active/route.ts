import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productSlug = searchParams.get("productSlug") || "";
    const productId = searchParams.get("productId") || "";
    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          { OR: [{ totalQuota: null }, { totalQuota: { gt: 0 } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        maxDiscount: true,
        minSpend: true,
        totalQuota: true,
        applicableProducts: true,
        endsAt: true,
      },
    });

    const filtered = coupons.filter((c) => {
      if (!c.applicableProducts || c.applicableProducts === "ALL") return true;
      try {
        const list = JSON.parse(c.applicableProducts);
        if (!Array.isArray(list) || list.length === 0) return true;
        return (
          (productSlug && list.includes(productSlug)) ||
          (productId && list.includes(productId))
        );
      } catch {
        return true;
      }
    });

    return NextResponse.json({
      success: true,
      coupons: filtered.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: c.value,
        maxDiscount: c.maxDiscount,
        minSpend: c.minSpend,
        totalQuota: c.totalQuota,
        endsAt: c.endsAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, coupons: [], error: error.message },
      { status: 500 }
    );
  }
}
