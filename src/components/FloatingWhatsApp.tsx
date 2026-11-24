"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ExternalLink, ShieldCheck, Clock } from "lucide-react";

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDockMenuOpen, setIsDockMenuOpen] = useState(false);

  // Listen to mobile floating dock open state to prevent overlapping
  useEffect(() => {
    const handler = (e: any) => {
      setIsDockMenuOpen(Boolean(e.detail?.open));
    };
    window.addEventListener("xyzpedia:dock-menu", handler);
    return () => window.removeEventListener("xyzpedia:dock-menu", handler);
  }, []);

  // Hide on admin & struk receipt pages
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/struk") ||
    (typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/struk")))
  ) {
    return null;
  }

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890";
  const cleanNumber = waNumber.replace(/\D/g, "");

  const handleOpenWhatsApp = (message?: string) => {
    const text = encodeURIComponent(
      message || "Halo Admin XYZPEDIA! Saya ingin bertanya seputar produk / pesanan saya."
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
    setIsOpen(false);
  };

  return (
    <>
      {/* Centered Modal with Backdrop Blur when Chat Card is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#1a1a28] ink-border rounded-3xl shadow-[6px_6px_0px_#000000] p-5 animate-in zoom-in-95 duration-200 space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#ffd731] flex items-center justify-center ink-border shrink-0 shadow-[2px_2px_0px_#000000] p-0.5">
                  <img
                    src="/brand/stiker/xyzi-stiker-halo.png"
                    alt="XYZI CS"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                    <span>Customer Support</span>
                    <span className="w-2 h-2 rounded-full bg-[#55db9c] inline-block animate-pulse" />
                  </h4>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Respon Cepat 24 Jam Nonstop</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-100 text-gray-500 hover:text-red-600 ink-border flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat greeting bubble */}
            <div className="bg-[#f3f4f6] dark:bg-[#20202e] p-3 rounded-2xl text-xs font-semibold text-carbon dark:text-gray-200 border border-gray-200 dark:border-gray-800">
              Halo Kak! 👋 Ada yang bisa kami bantu seputar top up game atau kredensial akun premium?
            </div>

            {/* Quick Question Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleOpenWhatsApp("Halo Min, saya mau konfirmasi pembayaran akun premium manual saya.")}
                className="w-full text-left px-3.5 py-2.5 bg-white dark:bg-[#181824] hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 ink-border transition-all flex items-center justify-between shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>🔑</span>
                  <span>Konfirmasi Kredensial Manual</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp("Halo Min, mau tanya status transaksi top up game saya.")}
                className="w-full text-left px-3.5 py-2.5 bg-white dark:bg-[#181824] hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 ink-border transition-all flex items-center justify-between shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>🧾</span>
                  <span>Tanya Status Pesanan</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp("Halo Min, saya butuh bantuan kendala pembayaran QRIS.")}
                className="w-full text-left px-3.5 py-2.5 bg-white dark:bg-[#181824] hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 ink-border transition-all flex items-center justify-between shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>💳</span>
                  <span>Bantuan Kendala Pembayaran</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            {/* Direct WhatsApp Chat Action */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button
                type="button"
                onClick={() => handleOpenWhatsApp()}
                className="w-full py-2.5 px-4 bg-[#25d366] hover:bg-[#20ba59] text-white rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat Langsung via WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-[#2e7d32] dark:text-[#4ade80]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Admin XYZPEDIA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button — Auto-hides when modal is open OR when bottom dock sheet is open */}
      {!isOpen && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-3.5 sm:right-6 z-40 transition-all duration-200 ${
            isDockMenuOpen ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-3 bg-[#25d366] hover:bg-[#20ba59] text-white rounded-full ink-border shadow-[3px_3px_0px_#000000] md:shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer font-black text-xs uppercase"
            aria-label="Bantuan CS WhatsApp"
          >
            {/* Mascot Peeking Sticker */}
            <div className="absolute -top-6 -right-2 w-8 h-8 pointer-events-none group-hover:scale-115 group-hover:-rotate-12 transition-transform duration-200">
              <img
                src="/brand/stiker/xyzi-stiker-halo.png"
                alt="XYZI"
                className="w-full h-full object-contain drop-shadow-[1px_1px_0px_#000]"
              />
            </div>
            <span className="relative flex h-2.5 w-2.5 mr-0 md:mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <MessageCircle className="w-5 h-5 fill-white stroke-[2]" />
            <span className="hidden md:inline font-extrabold tracking-wide ml-1.5">
              Bantuan CS WhatsApp
            </span>
          </button>
        </div>
      )}
    </>
  );
}
