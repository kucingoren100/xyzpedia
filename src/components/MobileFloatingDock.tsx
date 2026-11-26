"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getWhatsAppUrl } from "@/lib/contact";
import {
  Home,
  LayoutGrid,
  Truck,
  MoreHorizontal,
  HelpCircle,
  ShieldCheck,
  MessageCircle,
  X,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";

export default function MobileFloatingDock() {
  const pathname = usePathname();

  // Hide mobile floating dock on admin & struk receipt pages
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/struk") ||
    (typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/struk")))
  ) {
    return null;
  }

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside or navigating
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Dispatch event so overlapping floating elements (like WhatsApp button) auto-hide when dock menu is open
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("xyzpedia:dock-menu", { detail: { open: isMoreOpen } })
    );
  }, [isMoreOpen]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent("xyzpedia:dock-menu", { detail: { open: false } })
      );
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreOpen]);

  // Hide on product checkout pages where ProductCustomizer has its own Floating Checkout Dock
  if (pathname.startsWith("/produk/")) {
    return null;
  }

  const isHome = pathname === "/";
  const isKatalog = pathname.startsWith("/katalog");
  const isCekTransaksi = pathname.startsWith("/cek-transaksi");
  const isMoreActive =
    pathname.startsWith("/bantuan") || pathname.startsWith("/kebijakan");

  return (
    <div
      ref={menuRef}
      className="lg:hidden fixed bottom-2.5 left-4 right-4 z-40 pointer-events-none"
    >
      <div className="max-w-[340px] mx-auto relative">
        {/* Lainnya Sheet (Pop-up Menu from ezastore style) */}
        {isMoreOpen && (
          <div className="pointer-events-auto absolute left-0 right-0 bottom-full mb-2 p-2.5 bg-white ink-border rounded-2xl shadow-[3px_3px_0px_0px_#000000] animate-in slide-in-from-bottom-2 duration-150 space-y-1">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-carbon">
              <span className="text-[10px] font-black uppercase text-carbon tracking-wider">
                Bantuan & Pintasan
              </span>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-5 h-5 rounded-full bg-[#f3f4f6] hover:bg-[#ffdad6] active:scale-90 ink-border flex items-center justify-center text-carbon"
              >
                <X className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <Link
              href="/bantuan"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#dceeff] active:scale-98 ink-border transition-all text-[11px] font-black text-carbon"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#fb4903]" />
                <span>Pusat Bantuan & FAQ</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>

            <Link
              href="/daftar-harga"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#ffd731]/40 active:scale-98 ink-border transition-all text-[11px] font-black text-carbon"
            >
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span>Daftar Harga Real-Time</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>

            <Link
              href="/kalkulator"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#dceeff] active:scale-98 ink-border transition-all text-[11px] font-black text-carbon"
            >
              <div className="flex items-center gap-2">
                <span>🧮</span>
                <span>Kalkulator MLBB</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>

            <Link
              href="/kebijakan"
              onClick={() => setIsMoreOpen(false)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#55db9c]/30 active:scale-98 ink-border transition-all text-[11px] font-black text-carbon"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
                <span>Garansi 100% & Ketentuan</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>

            <a
              href={getWhatsAppUrl("Halo Admin XYZPEDIA, saya butuh bantuan")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#ffd731] active:scale-98 ink-border transition-all text-[11px] font-black text-carbon"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#5c4ade]" />
                <span>WhatsApp CS 24/7</span>
              </div>
              <span className="text-[8px] bg-[#55db9c] text-carbon px-1.5 py-0.2 rounded-full ink-border font-black">
                Online
              </span>
            </a>

            {/* Quick Theme Switcher */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#f3f4f6] ink-border text-[11px] font-black text-carbon">
              <span className="flex items-center gap-1.5">
                <span>🌓 Mode Tampilan</span>
              </span>
              <ThemeToggle size="sm" />
            </div>

            <div className="pt-1.5 border-t border-carbon/20 grid grid-cols-4 gap-1 text-[8.5px] font-black uppercase text-center">
              <Link
                href="/katalog?cat=game-topup"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 bg-[#fbfbfd] hover:bg-[#dceeff] rounded-md ink-border"
              >
                🎮 Games
              </Link>
              <Link
                href="/katalog?cat=akun-premium"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 bg-[#fbfbfd] hover:bg-[#e9ccff] rounded-md ink-border"
              >
                🍿 Premium
              </Link>
              <Link
                href="/katalog?cat=voucher-digital"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 bg-[#fbfbfd] hover:bg-[#ffd731] rounded-md ink-border"
              >
                🎟️ Voucher
              </Link>
              <Link
                href="/katalog?cat=pulsa-ewallet"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 bg-[#fbfbfd] hover:bg-[#55db9c] rounded-md ink-border"
              >
                📱 Pulsa
              </Link>
            </div>
          </div>
        )}

        {/* Compact Floating Dock Capsule Pill */}
        <nav
          aria-label="Mobile Navigation Dock"
          className="pointer-events-auto bg-white/95 backdrop-blur-md ink-border rounded-full px-2 py-1 shadow-[2.5px_2.5px_0px_0px_#000000] flex items-center justify-around gap-1"
        >
          {/* 1. Beranda */}
          <Link
            href="/"
            prefetch={true}
            className={`flex flex-col items-center gap-0.5 min-w-[46px] py-1 px-1.5 rounded-xl transition-all active:scale-90 ${
              isHome
                ? "bg-[#ffd731] text-carbon ink-border shadow-[1px_1px_0px_0px_#000000]"
                : "text-carbon/70 hover:text-carbon"
            }`}
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[9px] font-black uppercase tracking-tight">
              Beranda
            </span>
          </Link>

          {/* 2. Produk / Katalog */}
          <Link
            href="/katalog"
            prefetch={true}
            className={`flex flex-col items-center gap-0.5 min-w-[46px] py-1 px-1.5 rounded-xl transition-all active:scale-90 ${
              isKatalog
                ? "bg-[#ffd731] text-carbon ink-border shadow-[1px_1px_0px_0px_#000000]"
                : "text-carbon/70 hover:text-carbon"
            }`}
          >
            <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[9px] font-black uppercase tracking-tight">
              Katalog
            </span>
          </Link>

          {/* 3. Lacak Pesanan / Cek Transaksi */}
          <Link
            href="/cek-transaksi"
            prefetch={true}
            className={`flex flex-col items-center gap-0.5 min-w-[46px] py-1 px-1.5 rounded-xl transition-all active:scale-90 ${
              isCekTransaksi
                ? "bg-[#ffd731] text-carbon ink-border shadow-[1px_1px_0px_0px_#000000]"
                : "text-carbon/70 hover:text-carbon"
            }`}
          >
            <Truck className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[9px] font-black uppercase tracking-tight">
              Lacak
            </span>
          </Link>

          {/* 4. Lainnya Sheet Trigger */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            aria-expanded={isMoreOpen}
            className={`flex flex-col items-center gap-0.5 min-w-[46px] py-1 px-1.5 rounded-xl transition-all active:scale-90 cursor-pointer ${
              isMoreOpen || isMoreActive
                ? "bg-[#fb4903] text-white ink-border shadow-[1px_1px_0px_0px_#000000]"
                : "text-carbon/70 hover:text-carbon"
            }`}
          >
            <MoreHorizontal className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[9px] font-black uppercase tracking-tight">
              Lainnya
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
