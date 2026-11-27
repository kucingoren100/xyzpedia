"use client";

import { useEffect, useState } from "react";

export default function TopMarquee() {
  const [marquee, setMarquee] = useState<{ text: string; isActive: boolean }>({
    text: "⚡ PROSES OTOMATIS 24/7 ✦ JALUR API RESMI PUBLISHER ✦ CHECKOUT LANGSUNG (TANPA PERLU LOGIN) ✦ QRIS 0% BIAYA ADMIN ✦ PENGIRIMAN OTOMATIS SETELAH PEMBAYARAN TERVERIFIKASI",
    isActive: true,
  });

  useEffect(() => {
    fetch("/api/public/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config?.marquee) {
          setMarquee(data.config.marquee);
        }
      })
      .catch(() => {});
  }, []);

  if (!marquee.isActive || !marquee.text.trim()) {
    return null;
  }

  // Parse text into items separated by ✦ or • or |
  const parts = marquee.text
    .split(/✦|•|\|/)
    .map((s) => s.trim())
    .filter(Boolean);

  const colors = ["text-[#ffd731]", "text-[#55db9c]", "text-[#fb4903]", "text-[#4da2ff]"];

  const content = (
    <span className="px-6 flex items-center gap-3">
      {parts.length > 0 ? (
        parts.map((p, idx) => (
          <span key={idx} className="flex items-center gap-3">
            <span>{p}</span>
            {idx < parts.length - 1 && (
              <span className={colors[idx % colors.length]}>✦</span>
            )}
          </span>
        ))
      ) : (
        <span>{marquee.text}</span>
      )}
    </span>
  );

  return (
    <div className="w-full bg-[#000000] text-[#ffffff] overflow-hidden py-2 border-b border-[#000000] select-none z-50">
      <div className="animate-marquee whitespace-nowrap flex items-center text-xs font-black tracking-wider uppercase">
        {content}
        {content}
      </div>
    </div>
  );
}
