"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";

interface FlashSaleProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  stockStatus: string;
}

interface FlashSaleProduct {
  id: string;
  name: string;
  slug: string;
  developer?: string | null;
  thumbnailUrl: string;
  categorySlug: string;
  items: FlashSaleProductItem[];
}

export default function FlashSaleSection({ products }: { products: FlashSaleProduct[] }) {
  // Pick top 6 products for flash sale to fill a 6-col grid cleanly
  const flashSaleItems = useMemo(() => {
    const list: Array<{
      product: FlashSaleProduct;
      item: FlashSaleProductItem;
      discount: number;
      originalPrice: number;
      totalQuota: number;
      remainingQuota: number;
    }> = [];

    // Prioritize popular games & streaming
    const prioritySlugs = [
      "mobile-legends",
      "free-fire",
      "honor-of-kings",
      "arena-breakout",
      "genshin-impact",
      "netflix",
      "valorant",
      "spotify",
    ];

    const sortedProducts = [...products].sort((a, b) => {
      const aIdx = prioritySlugs.indexOf(a.slug);
      const bIdx = prioritySlugs.indexOf(b.slug);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });

    for (const prod of sortedProducts) {
      if (list.length >= 6) break;
      const availableItems = prod.items.filter((i) => i.stockStatus === "AVAILABLE" && i.price > 0);
      if (availableItems.length === 0) continue;

      // Select an entry-level or popular denomination
      const item = availableItems[Math.min(1, availableItems.length - 1)];

      const discount = item.discountPercent || 15;
      const originalPrice =
        item.originalPrice && item.originalPrice > item.price
          ? item.originalPrice
          : Math.round((item.price * 100) / (100 - discount));

      // Deterministic quota based on product slug & date
      const seed = (prod.slug.length * 7 + item.name.length * 3) % 10;
      const totalQuota = 15 + (seed % 10);
      const remainingQuota = Math.max(2, (seed % 4) + 2);

      list.push({
        product: prod,
        item,
        discount,
        originalPrice,
        totalQuota,
        remainingQuota,
      });
    }

    return list;
  }, [products]);

  if (flashSaleItems.length === 0) return null;

  return (
    <section id="flash-sale" className="w-full scroll-mt-28 space-y-3 sm:space-y-4">
      {/* Sleek Neo-Brutalist Section Title Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff4d4d] ink-border animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)] uppercase flex items-center gap-2">
            <span>Flash Sale Hari Ini</span>
            <span className="px-2 py-0.5 bg-[#ffd731] text-black text-[10px] font-black uppercase rounded-lg ink-border shadow-[1px_1px_0px_#000] hidden sm:inline-flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              <span>KUOTA TERBATAS</span>
            </span>
          </h2>
        </div>

        <Link
          href="/katalog"
          className="text-xs font-black uppercase text-[#fb4903] hover:underline flex items-center gap-1"
        >
          <span>Lihat Semua Promo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Flash Sale Product Cards - 100% Matching Catalog Card Size */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {flashSaleItems.map(({ product, item, discount, originalPrice, totalQuota, remainingQuota }) => {
          const soldPercentage = Math.round(((totalQuota - remainingQuota) / totalQuota) * 100);

          return (
            <Link
              key={`${product.id}-${item.id}`}
              href={`/produk/${product.slug}`}
              className="group bg-white dark:bg-[#181824] rounded-2xl ink-border dark:border-[#38384a] p-3 flex flex-col justify-between relative overflow-hidden shadow-[3px_3px_0px_0px_#000000] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#000000] transition-all"
            >
              <div className="space-y-2">
                {/* Thumbnail matching catalog aspect ratio */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden ink-border dark:border-[#38384a] bg-[#e9e9e9] dark:bg-[#20202e]">
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Discount Sticker */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black ink-border uppercase tracking-tight bg-[#ff4d4d] text-white shadow-[1px_1px_0px_#000]">
                    HEMAT {discount}%
                  </span>
                  {/* Developer Tag */}
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-black ink-border bg-black/80 backdrop-blur-sm text-white uppercase">
                    {product.developer || "OFFICIAL"}
                  </span>
                </div>

                {/* Title & Variant Name */}
                <div>
                  <h3 className="text-xs font-black text-carbon dark:text-white truncate group-hover:text-[#fb4903] transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {item.name}
                  </p>
                </div>

                {/* Price Display */}
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 line-through font-bold block leading-none">
                    Rp {originalPrice.toLocaleString("id-ID")}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-[#fb4903] font-[var(--font-bricolage)] leading-none">
                    Rp {item.price.toLocaleString("id-ID")}
                  </div>
                </div>

                {/* Compact Quota Bar */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#ff4d4d]">
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      <span>Sisa {remainingQuota} Slot</span>
                    </span>
                    <span className="text-gray-400 font-bold">{soldPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full ink-border overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffd731] via-[#fb4903] to-[#ff4d4d] rounded-full"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button Pill matching ProductCard */}
              <div className="mt-2.5 w-full bg-[#ffd731] text-black group-hover:bg-[#fb4903] group-hover:text-white py-1.5 rounded-full ink-border dark:border-[#38384a] text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors shadow-[1px_1px_0px_#000]">
                <span>Serbu Promo</span>
                <ArrowRight className="w-3 h-3 stroke-[3]" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
