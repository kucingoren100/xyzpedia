import { prisma } from "@/lib/prisma";
import AdminGaransiClient from "@/components/admin/AdminGaransiClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pusat Klaim Garansi & Tiket | Admin XYZPEDIA",
};

export default async function AdminGaransiPage() {
  const claims = await prisma.warrantyClaim.findMany({
    orderBy: { createdAt: "desc" },
  });

  const invoiceNumbers = Array.from(new Set(claims.map((c) => c.invoiceNumber)));
  const orders = await prisma.order.findMany({
    where: { invoiceNumber: { in: invoiceNumbers } },
    include: {
      product: {
        select: { name: true, slug: true, categorySlug: true },
      },
      productItem: {
        select: { name: true },
      },
    },
  });

  const orderMap = new Map(orders.map((o) => [o.invoiceNumber, o]));
  const enrichedClaims = claims.map((c) => ({
    ...c,
    order: orderMap.get(c.invoiceNumber) || null,
  }));

  return <AdminGaransiClient initialClaims={enrichedClaims} />;
}
