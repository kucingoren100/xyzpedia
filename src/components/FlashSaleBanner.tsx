"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Clock, ArrowRight, Zap } from "lucide-react";

export default function FlashSaleBanner() {
  const pathname = usePathname();

  // Hide customer banner on admin dashboard & admin pages
  if (
    pathname?.startsWith("/admin") ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))
  ) {
    return null;
  }

  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 3, minutes: 59, seconds: 59 }; // loop daily reset
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="w-full bg-[#ff4d4d] dark:bg-[#b91c1c] text-white border-y-2 border-black py-2.5 px-4 shadow-[0_2px_0_#000000]">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-[#ffd731] text-black rounded-lg ink-border font-black text-[10px] uppercase shadow-[1px_1px_0px_#000000] flex items-center gap-1 animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>FLASH SALE HARI INI</span>
          </span>
          <span className="font-extrabold text-white text-xs hidden md:inline">
            Diskon Spesial Top Up Game & Akun Premium hingga 40%!
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono font-black text-xs">
            <Clock className="w-3.5 h-3.5 text-[#ffd731]" />
            <span className="text-[11px] font-bold uppercase font-sans mr-1">Berakhir Dalam:</span>
            <span className="px-1.5 py-0.5 bg-black text-white rounded ink-border">
              {pad(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="px-1.5 py-0.5 bg-black text-white rounded ink-border">
              {pad(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="px-1.5 py-0.5 bg-black text-white rounded ink-border">
              {pad(timeLeft.seconds)}
            </span>
          </div>

          <Link
            href={pathname === "/" ? "#flash-sale" : "/#flash-sale"}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-100 text-black font-black text-[11px] uppercase rounded-full ink-border shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>Serbu Promo</span>
            <ArrowRight className="w-3 h-3 stroke-[3]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
