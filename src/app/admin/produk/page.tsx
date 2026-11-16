import { prisma } from "@/lib/prisma";
import AdminProdukClient from "@/components/admin/AdminProdukClient";

export const dynamic = "force-dynamic";

export default async function AdminProdukPage() {
  const [products, categories, itemSupplierPrices] = await Promise.all([
    prisma.product.findMany({
      orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
      include: {
        category: {
          select: { name: true, slug: true },
        },
        items: {
          orderBy: [{ order: "asc" }, { price: "asc" }],
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "supplierPrice" FROM "ProductItem"`
    ),
  ]);

  const priceMap = new Map<string, number>();
  for (const row of itemSupplierPrices) {
    if (row && row.id) {
      priceMap.set(String(row.id), Number(row.supplierPrice) || 0);
    }
  }

  const productsWithSupplierPrice = products.map((prod) => ({
    ...prod,
    items: prod.items.map((item) => ({
      ...item,
      supplierPrice: priceMap.get(item.id) ?? (item as any).supplierPrice ?? 0,
    })),
  }));

  return (
    <AdminProdukClient
      initialProducts={productsWithSupplierPrice as any}
      categories={categories}
    />
  );
}
