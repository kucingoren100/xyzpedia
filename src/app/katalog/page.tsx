import { prisma } from "@/lib/prisma";
import KatalogClient from "@/components/KatalogClient";
import { Suspense } from "react";

export default async function KatalogPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      items: {
        select: { price: true, stockStatus: true },
      },
    },
    orderBy: [
      { category: { order: "asc" } },
      { name: "asc" },
    ],
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <Suspense fallback={<div className="py-20 text-center font-bold text-sm">Memuat katalog...</div>}>
        <KatalogClient categories={categories} products={products} />
      </Suspense>
    </div>
  );
}
