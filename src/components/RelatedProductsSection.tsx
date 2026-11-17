import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface RelatedProductsSectionProps {
  currentSlug: string;
  categorySlug: string;
}

export default async function RelatedProductsSection({
  currentSlug,
  categorySlug,
}: RelatedProductsSectionProps) {
  // 1. Fetch related products from the same category first
  let related = await prisma.product.findMany({
    where: {
      categorySlug,
      slug: { not: currentSlug },
      isActive: true,
    },
    take: 6,
    include: {
      items: {
        orderBy: { price: "asc" },
        select: {
          price: true,
          originalPrice: true,
          discountPercent: true,
          stockStatus: true,
        },
      },
    },
    orderBy: [{ isPopular: "desc" }, { name: "asc" }],
  });

  // 2. If fewer than 4 related in same category, supplement with popular products from other categories
  if (related.length < 4) {
    const additional = await prisma.product.findMany({
      where: {
        slug: { notIn: [currentSlug, ...related.map((p) => p.slug)] },
        isActive: true,
      },
      take: 4 - related.length,
      include: {
        items: {
          orderBy: { price: "asc" },
          select: {
            price: true,
            originalPrice: true,
            discountPercent: true,
            stockStatus: true,
          },
        },
      },
      orderBy: [{ isPopular: "desc" }, { name: "asc" }],
    });
    related = [...related, ...additional];
  }

  if (related.length === 0) return null;

  return (
    <section className="bg-white dark:bg-[#161622] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-7 shadow-[4px_4px_0px_0px_#000000] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#ffd731] text-black ink-border">
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-[var(--font-bricolage)] text-base sm:text-lg font-black uppercase text-carbon dark:text-white tracking-wide">
              Produk Terkait di XYZPEDIA
            </h3>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Rekomendasi layanan populer lainnya yang mungkin Anda sukai
            </p>
          </div>
        </div>

        <Link
          href="/katalog"
          prefetch={true}
          className="text-xs font-black uppercase text-gray-600 dark:text-gray-400 hover:text-carbon dark:hover:text-[#ffd731] flex items-center gap-1 transition-colors"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid Cards (Exact style from user screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {related.map((prod) => {
          const minPrice = prod.items[0]?.price ?? 0;
          const maxDiscount = Math.max(
            ...prod.items.map((i) => i.discountPercent || 0),
            0
          );
          const hasAvailable = prod.items.some(
            (i) => i.stockStatus === "AVAILABLE"
          );

          return (
            <Link
              key={prod.id}
              href={`/produk/${prod.slug}`}
              prefetch={true}
              className="group bg-[#fbfbfd] dark:bg-[#1a1a28] ink-border dark:border-[#38384a] rounded-2xl p-3 flex flex-col justify-between transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-y-0 active:shadow-none"
            >
              {/* Product Image / Icon (Clean 1:1 ratio matching screenshot) */}
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-white dark:bg-[#12121c] ink-border dark:border-[#2d2d3d] flex items-center justify-center p-1 relative mb-2.5">
                <img
                  src={prod.thumbnailUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>

              {/* Product Meta */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-carbon dark:text-white truncate group-hover:text-[#fb4903] dark:group-hover:text-[#ffd731] transition-colors">
                    {prod.name}
                  </h4>

                  {/* Promo Tag or Category */}
                  {maxDiscount > 0 ? (
                    <div className="mt-1">
                      <span className="inline-block bg-[#f3f4f6] dark:bg-[#252538] text-gray-700 dark:text-gray-300 text-[9.5px] font-black px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700">
                        Hemat s/d {maxDiscount}%
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className="inline-block bg-gray-100 dark:bg-[#20202e] text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {prod.developer || "Resmi"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Price & Status (Exact to screenshot) */}
                <div className="pt-2 flex items-baseline justify-between gap-1 border-t border-gray-100 dark:border-gray-800/80">
                  <span className="text-xs font-black text-carbon dark:text-white font-mono">
                    Rp{minPrice.toLocaleString("id-ID")}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase ${
                      hasAvailable
                        ? "text-[#10b981] dark:text-[#55db9c]"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {hasAvailable ? "Tersedia" : "Stok habis"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
