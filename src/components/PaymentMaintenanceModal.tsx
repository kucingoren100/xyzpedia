"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Wrench, X, Sparkles, MessageCircle, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { MAINTENANCE_CONFIG } from "@/config/maintenance";

interface PaymentMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  itemName?: string;
  targetId?: string;
  totalPrice?: number;
}

export default function PaymentMaintenanceModal({
  isOpen,
  onClose,
  productName,
  itemName,
  targetId,
  totalPrice,
}: PaymentMaintenanceModalProps) {
  // Handle ESC key to close modal
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

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6289646661132";
  const waMessage = encodeURIComponent(
    `Halo Min XYZPEDIA, saya tertarik belanja ${productName || "produk"}${
      itemName ? ` (${itemName})` : ""
    }. Mau tanya kapan sistem pembayaran aktif kembali? Terima kasih!`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-6 sm:p-7 max-w-md w-full relative shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#ffd731] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          aria-label="Tutup popup"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-[#262638] hover:bg-gray-200 dark:hover:bg-[#32324a] ink-border dark:border-[#4a4a60] flex items-center justify-center text-carbon dark:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot & Maintenance Icon Header */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="relative mb-3">
            {/* Mascot Image (Padxy) */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-sky-600/30 dark:from-cyan-900/40 dark:to-indigo-900/40 p-2 border-2 border-cyan-400/50 shadow-inner flex items-center justify-center">
              <img
                src="/brand/padxy-mascot.png"
                alt="Maskot XYZPEDIA Padxy"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
              />
            </div>
            {/* Maintenance Wrench Badge */}
            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-carbon font-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <Wrench className="w-4 h-4 animate-bounce" />
            </span>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{MAINTENANCE_CONFIG.badge}</span>
          </div>

          <h3 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black text-carbon dark:text-white uppercase leading-tight">
            {MAINTENANCE_CONFIG.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium mt-2 leading-relaxed">
            {MAINTENANCE_CONFIG.description}
          </p>
        </div>

        {/* Order Details Preview Box */}
        {(productName || itemName) && (
          <div className="bg-[#f8fafc] dark:bg-[#20202e] rounded-2xl p-3.5 ink-border dark:border-[#38384a] text-xs space-y-2 mb-4">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-200 dark:border-[#2f2f42]">
              <span className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400">
                Pilihan Pesanan Anda
              </span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                {MAINTENANCE_CONFIG.statusText}
              </span>
            </div>

            <div className="flex items-center justify-between font-bold text-carbon dark:text-white">
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Produk:</span>
              <span className="text-right">{productName}</span>
            </div>

            {itemName && (
              <div className="flex items-center justify-between font-bold text-carbon dark:text-white">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">Nominal / Item:</span>
                <span className="text-right text-cyan-600 dark:text-cyan-400">{itemName}</span>
              </div>
            )}

            {targetId && (
              <div className="flex items-center justify-between font-bold text-carbon dark:text-white">
                <span className="text-gray-500 dark:text-gray-400 font-semibold">User ID Target:</span>
                <span className="text-right font-mono">{targetId}</span>
              </div>
            )}

            {typeof totalPrice === "number" && (
              <div className="flex items-center justify-between font-black pt-1 border-t border-gray-200 dark:border-[#2f2f42] text-carbon dark:text-white">
                <span>Total Estimasi:</span>
                <span className="text-sm text-green-700 dark:text-green-400">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Secondary Info */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium text-center mb-5 leading-normal">
          {MAINTENANCE_CONFIG.secondaryText}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-carbon text-white dark:bg-[#ffd731] dark:text-black font-black uppercase text-xs sm:text-sm rounded-xl ink-border dark:border-[#ffd731] hover:bg-[#fb4903] dark:hover:bg-[#f5c800] active:scale-95 transition-all shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Siap Menunggu! (Tutup)</span>
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-transparent text-green-600 dark:text-green-400 hover:bg-green-500/10 font-black uppercase text-xs rounded-xl border-2 border-green-500/60 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Tanya Admin via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
