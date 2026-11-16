"use client";

import { useEffect, useState } from "react";
import { Zap, X, ShieldCheck, Clock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "xyzpedia_announcement_seen";

export default function StoreAnnouncementModal() {
  const pathname = usePathname();

  // Hide customer announcement on admin dashboard & admin pages
  if (
    pathname?.startsWith("/admin") ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))
  ) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    try {
      const lastSeen = localStorage.getItem(STORAGE_KEY);
      if (lastSeen) {
        const date = new Date(parseInt(lastSeen, 10));
        const now = new Date();
        // If seen today, don't open
        if (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        ) {
          return;
        }
      }
      // Small timeout so page loads first
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      try {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {}
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1a28] ink-border rounded-3xl shadow-[8px_8px_0px_#000000] overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffd731] text-black font-black text-xs uppercase rounded-full ink-border shadow-[2px_2px_0px_#000000]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pemberitahuan Resmi Toko</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Hero Title */}
        <div className="space-y-1">
          <h3 className="font-[var(--font-bricolage)] text-2xl font-black uppercase text-carbon dark:text-white leading-tight">
            ⚡ Transaksi Instan 24 Jam Nonstop!
          </h3>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Selamat datang di <strong>XYZPEDIA</strong>. Seluruh sistem pembayaran QRIS Dinamis dan server gateway top up kami beroperasi penuh secara real-time.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 p-3 bg-[#eff6ff] dark:bg-[#152338] ink-border rounded-2xl">
            <div className="p-2 bg-[#3b82f6] text-white rounded-xl ink-border shrink-0 shadow-[1px_1px_0px_#000000]">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                Proses Otomatis &lt; 5 Detik
              </h4>
              <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                Sistem verifikasi QRIS otomatis tanpa perlu kirim bukti transfer manual.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[#f0fdf4] dark:bg-[#0f291e] ink-border rounded-2xl">
            <div className="p-2 bg-[#22c55e] text-white rounded-xl ink-border shrink-0 shadow-[1px_1px_0px_#000000]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                100% Legal & Bergaransi
              </h4>
              <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                Semua diamond, voucher, dan akun premium dijamin aman dengan perlindungan garansi toko.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 pt-1">
          <Link
            href="/katalog"
            onClick={handleClose}
            className="w-full py-3 bg-[#5c4ade] hover:bg-[#4d3bc9] text-white font-black text-xs uppercase rounded-2xl ink-border shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>Mulai Belanja Sekarang</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>

          <div className="flex items-center justify-center gap-2">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#5c4ade] rounded"
              />
              <span>Jangan tampilkan lagi hari ini</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
