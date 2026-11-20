import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CITIES = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Medan",
  "Semarang",
  "Yogyakarta",
  "Makassar",
  "Tangerang",
  "Bekasi",
  "Depok",
  "Palembang",
  "Malang",
  "Denpasar",
];

export async function GET() {
  try {
    // Only fetch 100% genuine paid/successful orders from database
    const realOrders = await prisma.order.findMany({
      where: {
        status: { in: ["SUCCESS", "PAID"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        product: { select: { name: true, slug: true, thumbnailUrl: true } },
        productItem: { select: { name: true } },
      },
    });

    const items = realOrders.map((o, idx) => {
      const city = CITIES[(o.invoiceNumber.charCodeAt(o.invoiceNumber.length - 1) + idx) % CITIES.length];
      const buyerName = o.customerEmail
        ? `${o.customerEmail.slice(0, 3)}***`
        : o.customerPhone
        ? `${o.customerPhone.slice(0, 4)}****`
        : "Pembeli";

      const diffMinutes = Math.max(
        1,
        Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
      );
      const timeAgo =
        diffMinutes < 60
          ? `${diffMinutes} menit lalu`
          : diffMinutes < 1440
          ? `${Math.floor(diffMinutes / 60)} jam lalu`
          : "Hari ini";

      return {
        id: o.id,
        productName: o.product.name,
        variantName: o.productItem.name,
        city,
        buyerName,
        timeAgo,
        thumbnailUrl: o.product.thumbnailUrl,
      };
    });

    return NextResponse.json({
      success: true,
      orders: items,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, orders: [] }, { status: 500 });
  }
}
