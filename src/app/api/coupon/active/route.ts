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
      if (!c.applicableProducts || c.applicableProducts.trim().toUpperCase() === "ALL") return true;
      let list: string[] = [];
      try {
        const parsed = JSON.parse(c.applicableProducts);
        list = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        list = c.applicableProducts.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (list.length === 0) return true;

      const slugLower = productSlug.trim().toLowerCase();
      const idLower = productId.trim().toLowerCase();

      return list.some((entry) => {
        const raw = String(entry).trim().toLowerCase();
        if (raw === "all") return true;
        if (raw.startsWith("sku:")) return true; // SKU-specific coupons are shown on product page and validated per variant
        const normalized = raw.replace(/^prod:/, "").trim();
        return (slugLower && normalized === slugLower) || (idLower && normalized === idLower);
      });
    });

    const codes = filtered.map((c) => c.code);
    const usedGrouped =
      codes.length > 0
        ? await prisma.order.groupBy({
            by: ["couponCode"],
            where: {
              couponCode: { in: codes },
              status: { in: ["PENDING", "PAID", "PROCESSING", "SUCCESS"] },
            },
            _count: { _all: true },
          })
        : [];
    const usedMap = new Map<string, number>();
    for (const row of usedGrouped) {
      if (row.couponCode) {
        usedMap.set(row.couponCode.toUpperCase(), row._count._all);
      }
    }

    const availableCoupons = filtered
      .map((c) => {
        const used = usedMap.get(c.code.toUpperCase()) || 0;
        const remainingQuota =
          typeof c.totalQuota === "number" ? Math.max(0, c.totalQuota - used) : null;
        return {
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          maxDiscount: c.maxDiscount,
          minSpend: c.minSpend,
          totalQuota: remainingQuota,
          endsAt: c.endsAt,
        };
      })
      .filter((c) => c.totalQuota === null || c.totalQuota > 0);

    return NextResponse.json({
      success: true,
      coupons: availableCoupons,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, coupons: [], error: error.message },
      { status: 500 }
    );
  }
}
