"use client";

import React, { useEffect } from "react";
import { X, Sparkles, Clock, AlertTriangle } from "lucide-react";

interface PaymentMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  itemName?: string;
  targetId?: string;
  totalPrice?: number;
  badge?: string;
  title?: string;
  description?: string;
  secondaryText?: string;
  estimatedTime?: string;
}

export default function PaymentMaintenanceModal({
  isOpen,
  onClose,
  productName,
  itemName,
  totalPrice,
  badge,
  title,
  description,
  secondaryText,
  estimatedTime,
}: PaymentMaintenanceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayBadge = badge || "PEMELIHARAAN SISTEM • MAINTENANCE";
  const displayTitle = title || "Sedang Dalam Pemeliharaan";
  const displayDesc =
    description ||
    "Halo Gamers! 🚀 Layanan pembelian sedang dalam tahap pemeliharaan / perbaikan berkala. Pembelian akan segera dibuka kembali dalam waktu dekat!";
  const displayEst = estimatedTime || "Estimasi Buka: Segera (Coming Soon)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-5 max-w-sm w-full relative shadow-[5px_5px_0px_0px_#000000] dark:shadow-[5px_5px_0px_0px_#ffd731] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Close Pojok Kanan Atas */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#34344d] flex items-center justify-center text-carbon dark:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Maskot & Badge Mini */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/40 p-1 flex-shrink-0 flex items-center justify-center">
            <img
              src="/brand/padxy-mascot.png"
              alt="Padxy Mascot"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{displayBadge}</span>
            </div>
            <h3 className="font-[var(--font-bricolage)] text-base font-black text-carbon dark:text-white uppercase leading-tight mt-0.5">
              {displayTitle}
            </h3>
          </div>
        </div>

        {/* Pesan Ringkas & Padat */}
        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-3">
          {displayDesc}
        </p>

        {/* Estimasi Waktu Buka */}
        {displayEst && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-[#26201a] border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-3">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{displayEst}</span>
          </div>
        )}

        {/* Ringkasan Pesanan Mini (1 Kotak Padat) */}
        {(productName || itemName) && (
          <div className="bg-gray-50 dark:bg-[#20202e] rounded-xl p-2.5 border border-gray-200 dark:border-[#2f2f42] text-[11px] font-bold text-carbon dark:text-gray-200 mb-4 flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="block truncate text-gray-800 dark:text-white">
                {productName}
              </span>
              {itemName && (
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold block truncate">
                  {itemName}
                </span>
              )}
            </div>
            {typeof totalPrice === "number" && (
              <span className="text-xs font-black text-green-700 dark:text-green-400 flex-shrink-0">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        )}

        {/* Satu Tombol Tunggal untuk Menutup */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-carbon text-white dark:bg-[#ffd731] dark:text-black font-black uppercase text-xs rounded-xl hover:bg-[#fb4903] dark:hover:bg-[#f5c800] active:scale-95 transition-all shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Oke, Mengerti</span>
        </button>
      </div>
    </div>
  );
}
