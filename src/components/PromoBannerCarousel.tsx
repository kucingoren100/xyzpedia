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
      className="relative w-full my-1 sm:my-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clean Full-Bleed Clickable Neo-Brutalist Banner */}
      <div className="relative w-full h-[120px] xs:h-[145px] sm:h-[180px] md:h-[210px] lg:h-[230px] rounded-2xl overflow-hidden ink-border shadow-[4px_4px_0px_#000] bg-black">
        <Link
          href={current.linkUrl || "/katalog"}
          className="block relative w-full h-full group cursor-pointer overflow-hidden"
          title={current.title}
        >
          {/* 100% Clean Image Artwork (No text / button overlays) */}
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            onError={(e: any) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200";
            }}
          />
        </Link>

        {/* Carousel Navigation Arrows (Clean & Subtle) */}
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
            <div className="absolute bottom-2 sm:bottom-3 right-4 sm:right-6 flex items-center gap-1.5 z-10 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? "w-5 sm:w-6 bg-[#ffd731]"
                      : "w-1.5 bg-white/70 hover:bg-white"
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
