"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Zap, X, ShieldCheck } from "lucide-react";

interface RecentOrder {
  id: string;
  productName: string;
  variantName: string;
  city: string;
  buyerName: string;
  timeAgo: string;
  thumbnailUrl: string;
}

export default function RecentOrdersTicker() {
  const pathname = usePathname();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Hide on admin and receipt pages
  const isHiddenPage =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/struk") ||
    pathname?.startsWith("/transaksi");

  useEffect(() => {
    if (isHiddenPage || dismissed) return;

    let mounted = true;
    fetch("/api/recent-orders")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [isHiddenPage, dismissed]);

  useEffect(() => {
    if (orders.length === 0 || dismissed || isHiddenPage) return;

    // Cycle loop: show 4s, hide 3s, advance index
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, 1500);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % orders.length);
        setVisible(true);
      }, 1000);
    }, 8000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(interval);
    };
  }, [orders, dismissed, isHiddenPage]);

  if (isHiddenPage || dismissed || orders.length === 0) return null;

  const current = orders[currentIndex];
  if (!current) return null;

  return (
    <div
      className={`fixed bottom-20 md:bottom-4 left-4 z-40 max-w-[320px] transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-white dark:bg-[#181824] ink-border rounded-2xl p-3 shadow-[4px_4px_0px_#000] flex items-center gap-3 relative">
        {/* Product Thumbnail / Icon */}
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 ink-border shrink-0">
          <img
            src={current.thumbnailUrl}
            alt={current.productName}
            className="w-full h-full object-cover"
            onError={(e: any) => {
              e.currentTarget.src = "/images/games/mlbb.webp";
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#55db9c] ink-border flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-black fill-black" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
            <span>{current.buyerName}</span>
            <span>•</span>
            <span className="text-carbon dark:text-gray-200">{current.city}</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{current.timeAgo}</span>
          </div>

          <p className="text-xs font-black uppercase text-carbon dark:text-white truncate font-[var(--font-bricolage)]">
            {current.productName}
          </p>

          <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate">
            {current.variantName} <span className="text-green-600 dark:text-green-400">✓ Berhasil</span>
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-1.5 right-1.5 p-1 text-gray-400 hover:text-black dark:hover:text-white rounded-lg"
          title="Tutup Notifikasi"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
