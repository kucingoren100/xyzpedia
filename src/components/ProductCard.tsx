"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Zap, Clock } from "lucide-react";
import { GameCurrencyIcon, getGameCurrencyMeta } from "@/components/GameCurrencyIcon";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    categorySlug?: string;
    developer?: string | null;
    thumbnailUrl: string;
    badgeText?: string | null;
    badgeColor?: string | null;
    items?: { price: number; stockStatus?: string }[];
  };
  aspectRatio?: "square" | "portrait";
}

export default function ProductCard({ product, aspectRatio }: ProductCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const items = product.items || [];
  const hasItems = items.length > 0;
  const availableItems = items.filter(
    (i) => !i.stockStatus || i.stockStatus === "AVAILABLE"
  );
  const isOutOfStock = hasItems && availableItems.length === 0;

  const minPrice =
    availableItems.length > 0
      ? Math.min(...availableItems.map((i) => i.price))
      : hasItems
      ? Math.min(...items.map((i) => i.price))
      : null;

  const isPortrait =
    aspectRatio === "portrait" ||
    aspectRatio !== "square";

  const isNonGame =
    product.categorySlug === "akun-premium" ||
    product.categorySlug === "voucher-digital" ||
    product.categorySlug === "pulsa-ewallet";
  const outOfStockLabel = isNonGame ? "Stok habis" : "Belum tersedia";
  const outOfStockBtn = isNonGame ? "Stok Habis" : "Belum Tersedia";

  // Tag styling based on developer / badge
  const badgeBg =
    product.badgeColor === "ember"
      ? "bg-[#fb4903] text-white"
      : product.badgeColor === "electric-blue"
      ? "bg-[#4da2ff] text-white"
      : product.badgeColor === "voltage-violet"
      ? "bg-[#5c4ade] text-white"
      : "bg-[#ffd731] text-black";

  return (
    <Link
      ref={cardRef}
      href={`/produk/${product.slug}`}
      className={`group bg-white dark:bg-[#181824] rounded-2xl ink-border dark:border-[#38384a] p-3 flex flex-col justify-between relative overflow-hidden transition-all duration-700 ease-out will-change-[filter,transform,opacity] ${
        isVisible
          ? "blur-0 opacity-100 translate-y-0 scale-100 shadow-[3px_3px_0px_0px_#000000] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#000000]"
          : "blur-md opacity-30 translate-y-7 scale-[0.96] shadow-none pointer-events-none"
      }`}
    >
      <div className="space-y-2">
        {/* Adaptive Aspect Ratio Image (1:1 for games, 4:5 for premium accounts) */}
        <div
          className={`relative w-full ${
            isPortrait ? "aspect-[4/5]" : "aspect-square"
          } rounded-xl overflow-hidden ink-border dark:border-[#38384a] bg-[#e9e9e9] dark:bg-[#20202e]`}
        >
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? "grayscale-[35%]" : ""
            }`}
            loading="lazy"
          />

          {/* Developer / Badge Sticker (Specialized for Akun Premium: Instan vs Manual) */}
          {product.categorySlug === "akun-premium" ? (
            (product.developer || "").toLowerCase() === "manual" ||
            (product.badgeText || "").toUpperCase() === "MANUAL" ? (
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-black ink-border tracking-tight bg-[#4b5563] text-white flex items-center gap-1 shadow-[1px_1px_0px_#000000]">
                <Clock className="w-2.5 h-2.5 shrink-0" />
                <span>Manual</span>
              </span>
            ) : (
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-black ink-border tracking-tight bg-[#4338ca] text-white flex items-center gap-1 shadow-[1px_1px_0px_#000000]">
                <Zap className="w-2.5 h-2.5 shrink-0 fill-white" />
                <span>Instan</span>
              </span>
            )
          ) : (
            <span
              className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-black ink-border uppercase tracking-tight ${badgeBg}`}
            >
              {product.developer || product.badgeText || "INSTAN"}
            </span>
          )}

          {/* Game Currency Badge on top-right */}
          {(!isPortrait &&
            (product.categorySlug === "game-topup" ||
              product.thumbnailUrl.includes("/games/"))) && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-black ink-border bg-white dark:bg-[#20202e] text-carbon dark:text-white flex items-center gap-1 shadow-[1px_1px_0px_#000000]">
              <GameCurrencyIcon slugOrName={product.slug} className="w-3 h-3" />
              <span>{getGameCurrencyMeta(product.slug).label}</span>
            </span>
          )}

          {/* Out of stock label on thumbnail */}
          {isOutOfStock && (
            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-black ink-border bg-[#fee2e2] dark:bg-[#3b1219] text-[#991b1b] dark:text-[#f87171] shadow-[1px_1px_0px_#000000]">
              {outOfStockLabel}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xs font-black text-carbon dark:text-white truncate group-hover:text-[#fb4903] transition-colors">
            {product.name}
          </h3>
          {isOutOfStock ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-black text-[#991b1b] dark:text-[#f87171] bg-[#fee2e2] dark:bg-[#3b1219] px-1.5 py-0.5 rounded ink-border dark:border-[#5c1d28]">
                {outOfStockLabel}
              </span>
              {minPrice && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold line-through">
                  Rp {minPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
              Mulai{" "}
              <span className="font-black text-[#fb4903]">
                {minPrice ? `Rp ${minPrice.toLocaleString("id-ID")}` : "Cek Varian"}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Action Button Pill */}
      {isOutOfStock ? (
        <div className="mt-3 w-full bg-[#f3f4f6] dark:bg-[#20202e] text-gray-700 dark:text-gray-300 group-hover:bg-[#fee2e2] dark:group-hover:bg-[#3b1219] group-hover:text-[#991b1b] dark:group-hover:text-[#f87171] py-2 rounded-full ink-border dark:border-[#38384a] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors">
          <span>{outOfStockBtn}</span>
          <ArrowUpRight className="w-3 h-3 stroke-[3]" />
        </div>
      ) : (
        <div className="mt-3 w-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black group-hover:bg-[#fb4903] dark:group-hover:bg-[#fb4903] group-hover:text-white dark:group-hover:text-white py-2 rounded-full ink-border dark:border-[#38384a] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors">
          <span>Beli Langsung</span>
          <ArrowUpRight className="w-3 h-3 stroke-[3]" />
        </div>
      )}
    </Link>
  );
}
