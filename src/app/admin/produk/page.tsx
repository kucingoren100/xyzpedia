import { prisma } from "@/lib/prisma";
import AdminProdukClient from "@/components/admin/AdminProdukClient";

export const dynamic = "force-dynamic";

export default async function AdminProdukPage() {
  const [products, categories] = await Promise.all([
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
  ]);

  return (
    <AdminProdukClient
      initialProducts={products as any}
      categories={categories}
    />
  );
}
