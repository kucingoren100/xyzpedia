import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Concurrent fetch coupons, products, and order coupon usage
    const [coupons, products, usageOrders] = await Promise.all([
      prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          categorySlug: true,
          thumbnailUrl: true,
          items: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
            },
            orderBy: { price: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.order.findMany({
        where: {
          couponCode: { not: null },
          status: { in: ["PAID", "PROCESSING", "SUCCESS"] },
        },
        select: {
          couponCode: true,
          customerEmail: true,
          customerPhone: true,
          discountAmount: true,
        },
      }),
    ]);

    const usageMap: Record<
      string,
      { totalOrders: number; uniqueBuyers: Set<string>; totalDiscount: number }
    > = {};

    for (const order of usageOrders) {
      if (!order.couponCode) continue;
      const key = order.couponCode.trim().toUpperCase();
      if (!usageMap[key]) {
        usageMap[key] = {
          totalOrders: 0,
          uniqueBuyers: new Set<string>(),
          totalDiscount: 0,
        };
      }
      usageMap[key].totalOrders += 1;
      const buyerId = order.customerEmail || order.customerPhone || "anon";
      usageMap[key].uniqueBuyers.add(buyerId.toLowerCase());
      usageMap[key].totalDiscount += order.discountAmount || 0;
    }

    const couponsWithUsage = coupons.map((c) => {
      const u = usageMap[c.code.trim().toUpperCase()];
      return {
        ...c,
        usedCount: u ? u.totalOrders : 0,
        buyerCount: u ? u.uniqueBuyers.size : 0,
        totalSaved: u ? u.totalDiscount : 0,
      };
    });

    return NextResponse.json({ success: true, coupons: couponsWithUsage, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      type,
      value,
      maxDiscount,
      minSpend,
      active,
      applicableProducts,
      startsAt,
      endsAt,
    } = body;

    if (!code || value === undefined || value === null) {
      return NextResponse.json({ success: false, message: "Kode dan nilai diskon wajib diisi." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const appProductsVal =
      applicableProducts && typeof applicableProducts === "object"
        ? JSON.stringify(applicableProducts)
        : applicableProducts || "ALL";

    const parsedStartsAt = startsAt ? new Date(startsAt) : null;
    const parsedEndsAt = endsAt ? new Date(endsAt) : null;

    const coupon = await prisma.coupon.upsert({
      where: { code: cleanCode },
      update: {
        type: type || "fixed",
        value: Number(value),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minSpend: minSpend ? Number(minSpend) : 0,
        active: active !== undefined ? Boolean(active) : true,
        applicableProducts: appProductsVal,
        startsAt: parsedStartsAt,
        endsAt: parsedEndsAt,
      },
      create: {
        code: cleanCode,
        type: type || "fixed",
        value: Number(value),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minSpend: minSpend ? Number(minSpend) : 0,
        active: active !== undefined ? Boolean(active) : true,
        applicableProducts: appProductsVal,
        startsAt: parsedStartsAt,
        endsAt: parsedEndsAt,
      },
    });

    await logAuditEvent({
      actor: session.username,
      action: "save_coupon",
      target: cleanCode,
      summary: `Admin created/updated coupon ${cleanCode}: ${type} ${value} (Scope: ${appProductsVal})`,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, active, startsAt, endsAt } = body;

    if (!code) {
      return NextResponse.json({ success: false, message: "Kode kupon wajib diisi." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const updateData: any = {};
    if (active !== undefined) updateData.active = Boolean(active);
    if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt) : null;

    const updated = await prisma.coupon.update({
      where: { code: cleanCode },
      data: updateData,
    });

    await logAuditEvent({
      actor: session.username,
      action: "toggle_coupon_status",
      target: cleanCode,
      summary: `Admin changed coupon ${cleanCode} active state to ${active}`,
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const codeParam = url.searchParams.get("code");
    const body = await req.json().catch(() => ({}));
    const code = (codeParam || body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, message: "Kode kupon tidak diberikan." }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { code },
    });

    await logAuditEvent({
      actor: session.username,
      action: "delete_coupon",
      target: code,
      summary: `Admin deleted coupon ${code}`,
    });

    return NextResponse.json({ success: true, message: `Kupon ${code} berhasil dihapus.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
