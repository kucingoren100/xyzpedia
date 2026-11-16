"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ExternalLink, ShieldCheck, Clock } from "lucide-react";

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  // Hide customer WhatsApp button on admin & struk receipt pages
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/struk") ||
    (typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/struk")))
  ) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
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
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end">
      {/* Pop-up Chat Card */}
      {isOpen && (
        <div className="mb-3 w-80 max-w-[calc(100vw-32px)] bg-white dark:bg-[#1a1a28] ink-border rounded-2xl shadow-[6px_6px_0px_#000000] p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#25d366] text-white flex items-center justify-center ink-border font-black text-sm shadow-[1px_1px_0px_#000000]">
                CS
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                  <span>Customer Support</span>
                  <span className="w-2 h-2 rounded-full bg-[#55db9c] inline-block" />
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
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-3 space-y-2">
            <div className="bg-[#f3f4f6] dark:bg-[#20202e] p-2.5 rounded-xl text-xs font-semibold text-carbon dark:text-gray-200">
              Halo Kak! 👋 Ada yang bisa kami bantu seputar top up game atau kredensial akun premium?
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleOpenWhatsApp("Halo Min, saya mau konfirmasi pembayaran akun premium manual saya.")}
                className="w-full text-left px-3 py-1.5 bg-white dark:bg-[#181824] hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-300 ink-border transition-all flex items-center justify-between"
              >
                <span>🔑 Konfirmasi Kredensial Manual</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp("Halo Min, mau tanya status transaksi top up game saya.")}
                className="w-full text-left px-3 py-1.5 bg-white dark:bg-[#181824] hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-300 ink-border transition-all flex items-center justify-between"
              >
                <span>🧾 Tanya Status Pesanan</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp("Halo Min, saya butuh bantuan kendala pembayaran QRIS.")}
                className="w-full text-left px-3 py-1.5 bg-white dark:bg-[#181824] hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-300 ink-border transition-all flex items-center justify-between"
              >
                <span>💳 Bantuan Kendala Pembayaran</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
            <span className="flex items-center gap-1 text-[#2e7d32] dark:text-[#4ade80]">
              <ShieldCheck className="w-3 h-3" />
              <span>Official Admin XYZPEDIA</span>
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#25d366] hover:bg-[#20ba59] text-white rounded-full ink-border shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer font-black text-xs uppercase"
        aria-label="Bantuan WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white stroke-[2]" />
        <span className="hidden sm:inline font-extrabold tracking-wide">Bantuan CS WhatsApp</span>
      </button>
    </div>
  );
}
