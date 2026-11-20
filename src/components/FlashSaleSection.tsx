"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Flame, Clock, Zap, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { GameCurrencyIcon } from "@/components/GameCurrencyIcon";

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
  // Live Countdown Timer (Ticks every 1 second, resets daily at 23:59:59)
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Calculate remaining time until next 4-hour flash sale block
      const currentHour = now.getHours();
      const nextBlockHour = Math.ceil((currentHour + 1) / 4) * 4;
      const targetTime = new Date(now);
      targetTime.setHours(nextBlockHour, 0, 0, 0);

      const diff = Math.max(0, targetTime.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  // Pick top 4 products for flash sale
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
      "netflix",
      "honor-of-kings",
      "genshin-impact",
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
      if (list.length >= 4) break;
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
      const remainingQuota = Math.max(2, (seed % 6) + 1);

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
    <section id="flash-sale" className="w-full scroll-mt-24 space-y-4">
      {/* Neo-Brutalist Flash Sale Header Banner */}
      <div className="bg-gradient-to-r from-[#ff4d4d] via-[#fb4903] to-[#ff2b2b] text-white ink-border-thick rounded-3xl p-4 sm:p-6 shadow-[5px_5px_0px_0px_#000000] relative overflow-hidden">
        {/* Background Decorative Sparks */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 -skew-x-12 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#ffd731] text-black font-[var(--font-bricolage)] font-black text-xs uppercase rounded-lg ink-border flex items-center gap-1 shadow-[2px_2px_0px_#000] animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-black stroke-black" />
                <span>FLASH SALE REAL-TIME</span>
              </span>
              <span className="text-[11px] font-black uppercase text-white/90 hidden sm:inline">
                • Kuota Slot Terbatas
              </span>
            </div>
            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              Serbu Diskon Spesial Hari Ini!
            </h2>
            <p className="text-xs sm:text-[13px] font-bold text-white/90">
              Harga termurah langsung aktif. Dapatkan diamond game & akun streaming resmi sebelum kehabisan slot.
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="bg-black/90 text-white rounded-2xl ink-border p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shrink-0 shadow-[3px_3px_0px_#ffd731]">
            <Clock className="w-5 h-5 text-[#ffd731] animate-spin" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-300">
                BERAKHIR DALAM:
              </span>
              <div className="flex items-center gap-1.5 font-mono font-black text-base sm:text-lg">
                <span className="px-2 py-0.5 bg-[#1f1f2e] text-[#ffd731] rounded-lg ink-border border-white/20">
                  {pad(timeLeft.hours)}
                </span>
                <span className="text-[#ffd731]">:</span>
                <span className="px-2 py-0.5 bg-[#1f1f2e] text-[#ffd731] rounded-lg ink-border border-white/20">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="text-[#ffd731]">:</span>
                <span className="px-2 py-0.5 bg-[#1f1f2e] text-[#ffd731] rounded-lg ink-border border-white/20">
                  {pad(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Product Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {flashSaleItems.map(({ product, item, discount, originalPrice, totalQuota, remainingQuota }) => {
          const soldPercentage = Math.round(((totalQuota - remainingQuota) / totalQuota) * 100);

          return (
            <div
              key={`${product.id}-${item.id}`}
              className="bg-white dark:bg-[#161622] ink-border rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-y-1 transition-all group"
            >
              <div className="space-y-3">
                {/* Thumbnail & Discount Badge */}
                <div className="relative aspect-[4/3] rounded-xl ink-border overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#ff4d4d] text-white font-[var(--font-bricolage)] font-black text-[10px] sm:text-xs uppercase rounded-lg ink-border shadow-[1px_1px_0px_#000]">
                    HEMAT {discount}%
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm text-white font-black text-[9px] uppercase rounded">
                    {product.developer || "OFFICIAL"}
                  </div>
                </div>

                {/* Product Name & Variant */}
                <div>
                  <h3 className="font-[var(--font-bricolage)] font-black text-xs sm:text-sm text-carbon dark:text-white line-clamp-1 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {item.name}
                  </p>
                </div>

                {/* Price Display */}
                <div className="space-y-0.5">
                  <div className="text-[10px] text-gray-400 line-through font-bold">
                    Rp {originalPrice.toLocaleString("id-ID")}
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#fb4903] font-[var(--font-bricolage)] leading-none">
                    Rp {item.price.toLocaleString("id-ID")}
                  </div>
                </div>

                {/* Limited Quota Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-[#ff4d4d] flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>Sisa {remainingQuota} Slot</span>
                    </span>
                    <span className="text-gray-400 font-bold">{soldPercentage}% Terjual</span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full ink-border overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffd731] via-[#fb4903] to-[#ff4d4d] rounded-full transition-all duration-500"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Direct Buy CTA */}
              <Link
                href={`/produk/${product.slug}`}
                className="mt-3.5 w-full py-2.5 bg-[#ffd731] hover:bg-[#ffe266] text-black font-[var(--font-bricolage)] text-xs font-black uppercase rounded-xl ink-border shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Serbu Promo</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
