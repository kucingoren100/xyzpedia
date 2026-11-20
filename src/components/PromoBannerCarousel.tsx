"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, ExternalLink } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  badgeText: string | null;
  order: number;
}

export default function PromoBannerCarousel({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = banners.length;

  useEffect(() => {
    if (total <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [total, isHovered]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Neo-brutalist Banner Card */}
      <div className="relative w-full rounded-3xl overflow-hidden ink-border-thick shadow-[5px_5px_0px_#000] bg-carbon dark:bg-[#12121a] text-white">
        {/* Banner Link Wrapper */}
        <Link
          href={current.linkUrl || "/katalog"}
          className="block relative aspect-[21/9] sm:aspect-[24/9] md:aspect-[32/10] w-full group overflow-hidden"
        >
          {/* Background Image with subtle zoom on hover */}
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e: any) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200";
            }}
          />

          {/* Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex flex-col justify-center px-6 sm:px-10 md:px-14 py-4 space-y-2">
            {/* Badge */}
            {current.badgeText && (
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffd731] text-black text-[10px] sm:text-xs font-black uppercase tracking-wider ink-border rounded-lg shadow-[2px_2px_0px_#000]">
                  <Sparkles className="w-3 h-3 fill-black" />
                  <span>{current.badgeText}</span>
                </span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-[var(--font-bricolage)] text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white max-w-xl drop-shadow-[2px_2px_0px_#000]">
              {current.title}
            </h3>

            {/* Subtitle */}
            {current.subtitle && (
              <p className="text-xs sm:text-sm font-semibold text-gray-200 max-w-lg line-clamp-2 drop-shadow">
                {current.subtitle}
              </p>
            )}

            {/* CTA Pill */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-carbon group-hover:bg-[#55db9c] group-hover:text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-colors">
                <span>Lihat Promo</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>

        {/* Carousel Controls (Prev/Next) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center hover:bg-[#ffd731] active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Banner Sebelumnya"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center hover:bg-[#ffd731] active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Banner Selanjutnya"
            >
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 right-6 flex items-center gap-2 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ink-border cursor-pointer ${
                    currentIndex === idx
                      ? "w-7 bg-[#ffd731]"
                      : "w-2 bg-white/60 hover:bg-white"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
