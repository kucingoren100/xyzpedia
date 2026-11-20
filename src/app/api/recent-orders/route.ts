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
    const realOrders = await prisma.order.findMany({
      where: {
        status: { in: ["SUCCESS", "PAID"] },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
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
        : "Gamers";

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

    // If fewer than 4 real orders, add realistic fallback items
    if (items.length < 4) {
      const fallbacks = [
        {
          id: "fb-1",
          productName: "Mobile Legends",
          variantName: "Weekly Diamond Pass",
          city: "Jakarta",
          buyerName: "Dim***",
          timeAgo: "2 menit lalu",
          thumbnailUrl: "/images/games/mlbb.webp",
        },
        {
          id: "fb-2",
          productName: "Free Fire",
          variantName: "140 Diamonds",
          city: "Surabaya",
          buyerName: "Riz***",
          timeAgo: "5 menit lalu",
          thumbnailUrl: "/images/games/free-fire.webp",
        },
        {
          id: "fb-3",
          productName: "Wink VIP",
          variantName: "14 Hari · VIP+",
          city: "Bandung",
          buyerName: "Siti***",
          timeAgo: "8 menit lalu",
          thumbnailUrl: "https://waroengkuy.com/api/store-image/8?v=1793399279&sq=1",
        },
        {
          id: "fb-4",
          productName: "Honor of Kings",
          variantName: "80 Tokens",
          city: "Yogyakarta",
          buyerName: "Fik***",
          timeAgo: "11 menit lalu",
          thumbnailUrl: "/images/games/hok.webp",
        },
      ];
      items.push(...fallbacks.slice(0, 4 - items.length));
    }

    return NextResponse.json({ success: true, orders: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
