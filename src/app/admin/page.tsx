import { prisma } from "@/lib/prisma";
import AdminOverviewClient from "@/components/admin/AdminOverviewClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch stats from database
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalOrders,
    pendingOrders,
    paidOrders,
    successOrders,
    failedOrders,
    todayOrders,
    recentOrders,
    productsCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.order.count({ where: { status: "SUCCESS" } }),
    prisma.order.count({ where: { status: { in: ["FAILED", "EXPIRED"] } } }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday },
        status: "SUCCESS",
      },
      select: { totalAmount: true },
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

  // Calculate today's revenue & all-time revenue
  const todayRevenue = todayOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const allSuccessOrders = await prisma.order.findMany({
    where: { status: "SUCCESS" },
    select: { totalAmount: true },
  });
  const allTimeRevenue = allSuccessOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

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
