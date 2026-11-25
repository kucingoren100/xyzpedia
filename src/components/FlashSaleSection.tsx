"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

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
  // Live Countdown Timer (Ticks every 1 second, calculates remaining days, hours, mins, secs)
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 17,
    minutes: 27,
    seconds: 37,
  });

  // Track horizontal scroll progress for mobile landscape slider indicator
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollWidth - target.clientWidth;
    if (maxScroll > 0) {
      const progress = (target.scrollLeft / maxScroll) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target: 4 days from start of weekly cycle, resets at 23:59:59
      const targetTime = new Date(now);
      targetTime.setDate(now.getDate() + 4);
      targetTime.setHours(23, 59, 59, 999);

      const diff = Math.max(0, targetTime.getTime() - now.getTime());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  // Pick top 4 products for minimalist flash sale card row
  const flashSaleItems = useMemo(() => {
    const list: Array<{
      product: FlashSaleProduct;
      item: FlashSaleProductItem;
      discount: number;
      originalPrice: number;
    }> = [];

    // Prioritize popular games & apps
    const prioritySlugs = [
      "mobile-legends",
      "capcut",
      "netflix",
      "free-fire",
      "spotify",
      "honor-of-kings",
      "magic-chess",
      "arena-breakout",
      "genshin-impact",
      "valorant",
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

      const discount = item.discountPercent || (list.length === 0 ? 1 : list.length === 1 ? 10 : 3);
      const originalPrice =
        item.originalPrice && item.originalPrice > item.price
          ? item.originalPrice
          : Math.round((item.price * 100) / (100 - discount));

      list.push({
        product: prod,
        item,
        discount,
        originalPrice,
      });
    }

    return list;
  }, [products]);

  if (flashSaleItems.length === 0) return null;

  return (
    <section id="flash-sale" className="w-full scroll-mt-24">
      {/* Sleek Minimalist Dark Flash Sale Container */}
      <div className="bg-[#121622] border border-[#232b3e] rounded-3xl p-5 md:p-6 shadow-[4px_4px_0px_#000000]">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          {/* Left Title with Yellow Flash Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffd731] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
              <Zap className="w-5 h-5 fill-black stroke-black" />
            </div>
            <div>
              <h2 className="font-[var(--font-bricolage)] text-lg sm:text-xl font-black uppercase text-white tracking-tight leading-none">
                Flash sale
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1 leading-none">
                Harga turun sampai waktunya habis.
              </p>
            </div>
          </div>

          {/* Right Countdown Timer Pills */}
          <div className="flex items-center gap-1.5 font-mono shrink-0">
            <span className="text-xs text-gray-400 font-semibold mr-1 hidden sm:inline">
              Berakhir dalam
            </span>
            {/* Days */}
            <div className="bg-[#1a2234] border border-[#2d3850] rounded-xl px-2 py-1 text-center min-w-[34px]">
              <span className="text-xs font-black text-white block leading-none">{pad(timeLeft.days)}</span>
              <span className="text-[9px] text-gray-400 font-bold block leading-none mt-0.5">hari</span>
            </div>
            <span className="text-gray-500 font-bold">:</span>
            {/* Hours */}
            <div className="bg-[#1a2234] border border-[#2d3850] rounded-xl px-2 py-1 text-center min-w-[34px]">
              <span className="text-xs font-black text-white block leading-none">{pad(timeLeft.hours)}</span>
              <span className="text-[9px] text-gray-400 font-bold block leading-none mt-0.5">jam</span>
            </div>
            <span className="text-gray-500 font-bold">:</span>
            {/* Minutes */}
            <div className="bg-[#1a2234] border border-[#2d3850] rounded-xl px-2 py-1 text-center min-w-[34px]">
              <span className="text-xs font-black text-white block leading-none">{pad(timeLeft.minutes)}</span>
              <span className="text-[9px] text-gray-400 font-bold block leading-none mt-0.5">mnt</span>
            </div>
            <span className="text-gray-500 font-bold">:</span>
            {/* Seconds */}
            <div className="bg-[#1a2234] border border-[#2d3850] rounded-xl px-2 py-1 text-center min-w-[34px]">
              <span className="text-xs font-black text-white block leading-none">{pad(timeLeft.seconds)}</span>
              <span className="text-[9px] text-gray-400 font-bold block leading-none mt-0.5">dtk</span>
            </div>
          </div>
        </div>

        {/* Minimalist Cards Row - Landscape Horizontal Scroll on Mobile, 4-Col Grid on Desktop */}
        <div
          onScroll={handleScroll}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-1 px-1 sm:mx-0 sm:px-0"
        >
          {flashSaleItems.map(({ product, item, discount, originalPrice }) => {
            return (
              <Link
                key={`${product.id}-${item.id}`}
                href={`/produk/${product.slug}`}
                className="w-[235px] xs:w-[260px] sm:w-auto shrink-0 snap-start bg-[#181f30] hover:bg-[#202940] border border-[#27334d] rounded-2xl p-4 flex flex-col justify-between transition-all group hover:scale-[1.02] active:scale-[0.99] shadow-[2px_2px_0px_#000000]"
              >
                {/* Top Row: Game Avatar + Game Name + Discount Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 bg-[#222b40]">
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-300 truncate">
                      {product.name}
                    </span>
                  </div>
                  <span className="bg-[#ff4d4d] text-white text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-sm leading-none">
                    -{discount}%
                  </span>
                </div>

                {/* Middle Row: Item Thumbnail + Item Name */}
                <div className="flex items-center gap-3 my-3">
                  <div className="w-10 h-10 rounded-xl bg-[#222b40] p-1.5 border border-[#313e5a] flex items-center justify-center shrink-0">
                    <img
                      src={product.thumbnailUrl}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-md"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-xs sm:text-[13px] font-extrabold text-white group-hover:text-[#ffd731] transition-colors leading-snug line-clamp-2">
                    {item.name}
                  </h4>
                </div>

                {/* Bottom Row: Original Price (strikethrough) + Discount Price */}
                <div className="space-y-0.5 pt-2 border-t border-[#26324a]/70">
                  <span className="text-[11px] text-gray-400 line-through font-bold block leading-none">
                    Rp {originalPrice.toLocaleString("id-ID")}
                  </span>
                  <div className="text-sm sm:text-base font-black text-[#ffd731] font-[var(--font-bricolage)] leading-tight">
                    Rp {item.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Landscape Scroll Progress Indicator (Matching Reference Image) */}
        <div className="sm:hidden mt-3 flex justify-end pr-1">
          <div className="w-20 h-1 bg-[#232b3e] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ffd731] rounded-full transition-all duration-100"
              style={{
                width: "45%",
                transform: `translateX(${scrollProgress * 1.2}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
