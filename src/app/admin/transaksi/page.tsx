import { prisma } from "@/lib/prisma";
import AdminTransaksiClient from "@/components/admin/AdminTransaksiClient";

export const dynamic = "force-dynamic";

export default async function AdminTransaksiPage() {
  // Fetch initial orders & counts
  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      take: 25,
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

  const initialCounts = {
    ALL: counts[0],
    PENDING: counts[1],
    PAID: counts[2],
    PROCESSING: counts[3],
    SUCCESS: counts[4],
    FAILED_OR_EXPIRED: counts[5],
  };

  return (
    <AdminTransaksiClient
      initialOrders={orders}
      initialCounts={initialCounts}
    />
  );
}
