"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

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
    }, 5000);
    return () => clearInterval(interval);
  }, [total, isHovered]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  return (
    <div
      className="relative w-full my-1 sm:my-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Neo-brutalist Banner Card */}
      <div className="relative w-full h-[125px] xs:h-[145px] sm:h-[175px] md:h-[200px] lg:h-[215px] rounded-2xl overflow-hidden ink-border shadow-[4px_4px_0px_#000] bg-carbon dark:bg-[#12121a] text-white">
        {/* Banner Link Wrapper */}
        <Link
          href={current.linkUrl || "/katalog"}
          className="block relative w-full h-full group overflow-hidden"
        >
          {/* Background Image with subtle zoom */}
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e: any) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200";
            }}
          />

          {/* Gradient Overlay for Crisp Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent flex flex-col justify-center px-4 sm:px-8 md:px-12 py-2 space-y-1 sm:space-y-1.5 max-w-[80%] sm:max-w-[70%]">
            {/* Badge */}
            {current.badgeText && (
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ffd731] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-wider ink-border rounded-md shadow-[1.5px_1.5px_0px_#000]">
                  <Sparkles className="w-2.5 h-2.5 fill-black shrink-0" />
                  <span>{current.badgeText}</span>
                </span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-[var(--font-bricolage)] text-sm xs:text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-white line-clamp-1 drop-shadow-[2px_2px_0px_#000]">
              {current.title}
            </h3>

            {/* Subtitle */}
            {current.subtitle && (
              <p className="text-[10px] sm:text-xs font-semibold text-gray-200 line-clamp-1 drop-shadow hidden xs:block">
                {current.subtitle}
              </p>
            )}

            {/* CTA Pill */}
            <div className="pt-0.5 sm:pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-white text-carbon group-hover:bg-[#55db9c] group-hover:text-black rounded-lg sm:rounded-xl ink-border text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] transition-colors">
                <span>Lihat Promo</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-[#ffd731] text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Banner Sebelumnya"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-[#ffd731] text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Banner Selanjutnya"
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-2 sm:bottom-3 right-4 sm:right-6 flex items-center gap-1.5 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ink-border cursor-pointer ${
                    currentIndex === idx
                      ? "w-5 sm:w-6 bg-[#ffd731]"
                      : "w-1.5 bg-white/60 hover:bg-white"
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
