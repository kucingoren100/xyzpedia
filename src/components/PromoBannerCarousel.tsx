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

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    if (total <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [total, isHovered]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40; // minimum 40px swipe distance

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next slide
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev slide
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div
      className="relative w-full my-2 sm:my-3 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 100% Clean Clickable Graphic Banner (Zero Text, Zero Overlays) */}
      <div className="relative w-full h-[125px] xs:h-[150px] sm:h-[185px] md:h-[215px] lg:h-[240px] rounded-2xl overflow-hidden ink-border shadow-[4px_4px_0px_#000] bg-black">
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

        {/* Carousel Navigation Arrows — Visible on mobile, subtle on desktop hover */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-[#ffd731] text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 active:scale-95 cursor-pointer z-10"
              aria-label="Banner Sebelumnya"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-[#ffd731] text-black ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 active:scale-95 cursor-pointer z-10"
              aria-label="Banner Selanjutnya"
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Indicator Dots — Touch friendly, visible on mobile */}
            <div className="absolute bottom-2 sm:bottom-2.5 right-3 sm:right-4 flex items-center gap-1.5 z-10 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
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
