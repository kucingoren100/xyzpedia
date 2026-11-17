import { prisma } from "@/lib/prisma";
import AdminOverviewClient from "@/components/admin/AdminOverviewClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Concurrent fast aggregates in a single round-trip
  const [
    totalOrders,
    pendingOrders,
    paidOrders,
    successOrders,
    failedOrders,
    todayAgg,
    allTimeAgg,
    recentOrders,
    productsCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.order.count({ where: { status: "SUCCESS" } }),
    prisma.order.count({ where: { status: { in: ["FAILED", "EXPIRED"] } } }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfToday },
        status: "SUCCESS",
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { status: "SUCCESS" },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true, thumbnailUrl: true } },
        productItem: { select: { name: true, sku: true } },
      },
    }),
    prisma.product.count(),
  ]);

  const todayRevenue = todayAgg._sum.totalAmount || 0;
  const allTimeRevenue = allTimeAgg._sum.totalAmount || 0;

  return (
    <AdminOverviewClient
      stats={{
        totalOrders,
        pendingOrders,
        paidOrders,
        successOrders,
        failedOrders,
        todayRevenue,
        allTimeRevenue,
        productsCount,
      }}
      recentOrders={recentOrders}
    />
  );
}
