"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
      className="relative w-full my-2 sm:my-3 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 100% Clean Clickable Graphic Banner (Zero Text, Zero Overlays) */}
      <div className="relative w-full h-[120px] xs:h-[145px] sm:h-[180px] md:h-[210px] lg:h-[235px] rounded-2xl overflow-hidden ink-border shadow-[4px_4px_0px_#000] bg-black">
        <Link
          href={current.linkUrl || "/katalog"}
          className="block w-full h-full cursor-pointer overflow-hidden"
          title={`Buka Promo (${current.linkUrl || "/katalog"})`}
        >
          <img
            src={current.imageUrl}
            alt="Promo Banner"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01]"
            onError={(e: any) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200";
            }}
          />
        </Link>

        {/* Carousel Navigation Arrows — Only visible on mouse hover */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-[#ffd731] text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-95 cursor-pointer z-10"
              aria-label="Banner Sebelumnya"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-[#ffd731] text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-95 cursor-pointer z-10"
              aria-label="Banner Selanjutnya"
            >
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Indicator Dots — Subtle, visible on hover */}
            <div className="absolute bottom-2.5 right-4 flex items-center gap-1.5 z-10 bg-black/50 px-2 py-1 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? "w-5 bg-[#ffd731]"
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
