import { prisma } from "@/lib/prisma";
import HeroBanner from "@/components/HeroBanner";
import StorefrontClient from "@/components/StorefrontClient";

export default async function HomePage() {
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
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-10">
      {/* Promotional Hero Section */}
      <HeroBanner />

      {/* Interactive Catalog and Filtering */}
      <StorefrontClient categories={categories} products={products} />
    </div>
  );
}
