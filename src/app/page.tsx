import { prisma } from "@/lib/prisma";
import HeroBanner from "@/components/HeroBanner";
import PromoBannerCarousel from "@/components/PromoBannerCarousel";
import StorefrontClient from "@/components/StorefrontClient";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, products, banners] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.product.findMany({
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
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-10">
      {/* Promotional Hero Section */}
      <HeroBanner />

      {/* Dynamic Graphic Banner Carousel */}
      {banners.length > 0 && <PromoBannerCarousel banners={banners} />}

      {/* Interactive Catalog and Filtering */}
      <StorefrontClient categories={categories} products={products} />
    </div>
  );
}
