import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status !== "ALL") {
      if (status === "FAILED_OR_EXPIRED") {
        where.status = { in: ["FAILED", "EXPIRED"] };
      } else {
        where.status = status;
      }
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
        { targetUserId: { contains: search } },
        { product: { name: { contains: search } } },
      ];
    }

    const [totalMatching, orders, statusCounts] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              thumbnailUrl: true,
              categorySlug: true,
              developer: true,
            },
          },
          productItem: {
            select: {
              name: true,
              sku: true,
              price: true,
            },
          },
        },
      }),
      Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "PAID" } }),
        prisma.order.count({ where: { status: "PROCESSING" } }),
        prisma.order.count({ where: { status: "SUCCESS" } }),
        prisma.order.count({ where: { status: { in: ["FAILED", "EXPIRED"] } } }),
      ]),
    ]);

    const counts = {
      ALL: statusCounts[0],
      PENDING: statusCounts[1],
      PAID: statusCounts[2],
      PROCESSING: statusCounts[3],
      SUCCESS: statusCounts[4],
      FAILED_OR_EXPIRED: statusCounts[5],
    };

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalItems: totalMatching,
        totalPages: Math.ceil(totalMatching / limit) || 1,
      },
      counts,
    });
  } catch (error: any) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data transaksi." },
      { status: 500 }
    );
  }
}
