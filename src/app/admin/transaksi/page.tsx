import { prisma } from "@/lib/prisma";
import AdminTransaksiClient from "@/components/admin/AdminTransaksiClient";

export const dynamic = "force-dynamic";

export default async function AdminTransaksiPage() {
  // Fetch initial orders & grouped status counts in parallel
  const [orders, totalCount, statusCounts] = await Promise.all([
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
    prisma.order.count(),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countMap: Record<string, number> = {};
  for (const row of statusCounts) {
    countMap[row.status] = row._count.id;
  }

  const initialCounts = {
    ALL: totalCount,
    PENDING: countMap["PENDING"] || 0,
    PAID: countMap["PAID"] || 0,
    PROCESSING: countMap["PROCESSING"] || 0,
    SUCCESS: countMap["SUCCESS"] || 0,
    FAILED_OR_EXPIRED: (countMap["FAILED"] || 0) + (countMap["EXPIRED"] || 0),
  };

  return (
    <AdminTransaksiClient
      initialOrders={orders}
      initialCounts={initialCounts}
    />
  );
}
