"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { Truck } from "lucide-react";
import TopMarquee from "./TopMarquee";
import BrandLogo from "./BrandLogo";
import { ThemeToggle } from "./ThemeProvider";

function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat");

  const isKatalog = pathname === "/katalog";
  const isGame = isKatalog && currentCat === "game-topup";
  const isAkun = isKatalog && currentCat === "akun-premium";
  const isVoucher = isKatalog && currentCat === "voucher-digital";
  const isPulsa = (isKatalog && currentCat === "pulsa-ewallet") || pathname === "/pulsa-ewallet";
  const isSemua = isKatalog && (!currentCat || currentCat === "all");
  const isBantuan = pathname === "/bantuan";

  return (
    <nav className="hidden md:flex items-center gap-6 sm:gap-8 shrink-0 text-xs font-bold uppercase tracking-wider">
      <Link
        href="/katalog?cat=game-topup"
        prefetch={true}
        className={`transition-colors ${
          isGame
            ? "text-[#fb4903] underline decoration-2 underline-offset-4"
            : "text-carbon hover:text-[#fb4903]"
        }`}
      >
        Top Up Game
      </Link>
      <Link
        href="/katalog?cat=akun-premium"
        prefetch={true}
        className={`transition-colors ${
          isAkun
            ? "text-[#fb4903] underline decoration-2 underline-offset-4"
            : "text-carbon hover:text-[#fb4903]"
        }`}
      >
        Akun Premium
      </Link>
      <Link
        href="/katalog?cat=voucher-digital"
        prefetch={true}
        className={`transition-colors ${
          isVoucher
            ? "text-[#fb4903] underline decoration-2 underline-offset-4"
            : "text-carbon hover:text-[#fb4903]"
        }`}
      >
        Voucher Digital
      </Link>
      <Link
        href="/katalog?cat=pulsa-ewallet"
        prefetch={true}
        className={`transition-colors ${
          isPulsa
            ? "text-[#fb4903] underline decoration-2 underline-offset-4"
            : "text-carbon hover:text-[#fb4903]"
        }`}
      >
        Pulsa & E-Wallet
      </Link>
      <Link
        href="/katalog"
        prefetch={true}
        className={`transition-colors ${
          isSemua
            ? "text-[#fb4903] underline decoration-2 underline-offset-4"
            : "text-carbon hover:text-[#fb4903]"
        }`}
      >
        Semua Katalog
      </Link>
      <Link
        href="/bantuan"
        prefetch={true}
        className={`transition-colors ${
          isBantuan
            ? "text-[#fb4903] underline decoration-2 underline-offset-4"
            : "text-carbon hover:text-[#fb4903]"
        }`}
      >
        Bantuan & FAQ
      </Link>
    </nav>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  // Smart Hide on Scroll Down, Show on Scroll Up
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const prevScrollY = lastScrollYRef.current;
          const diff = currentScrollY - prevScrollY;

          // Always visible when near the very top of the page
          if (currentScrollY < 60) {
            setIsVisible(true);
          }
          // Scrolled down past threshold -> hide navbar
          else if (diff > 8 && currentScrollY > 120) {
            setIsVisible(false);
          }
          // Scrolled up -> show navbar
          else if (diff < -8) {
            setIsVisible(true);
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide storefront navbar on admin dashboard & struk receipt page
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/struk") ||
    (typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/struk")))
  ) {
    return null;
  }

  return (
    <div
      className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out shadow-[0_4px_12px_rgba(0,0,0,0.12)] ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* 1. Top Marquee Announcement */}
      <TopMarquee />

      {/* 2. Top Navigation Bar */}
      <header className="bg-[#ffffff] dark:bg-[#181824] border-b border-[#000000] dark:border-[#38384a]">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 max-w-6xl mx-auto gap-4">
          
          {/* Brand Logo - Responsive & enlarged for mobile & desktop */}
          <BrandLogo
            asLink
            href="/"
            size="md"
            imgClassName="h-[50px] sm:h-[58px] md:h-[66px] lg:h-[74px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />

          {/* Navigation Links with Suspense Boundary for searchParams */}
          <Suspense
            fallback={
              <nav className="hidden md:flex items-center gap-6 sm:gap-8 shrink-0 text-xs font-bold uppercase tracking-wider text-carbon">
                <Link href="/katalog?cat=game-topup">Top Up Game</Link>
                <Link href="/katalog?cat=akun-premium">Akun Premium</Link>
                <Link href="/katalog?cat=voucher-digital">Voucher Digital</Link>
                <Link href="/katalog?cat=pulsa-ewallet">Pulsa & E-Wallet</Link>
                <Link href="/katalog">Semua Katalog</Link>
                <Link href="/bantuan">Bantuan & FAQ</Link>
              </nav>
            }
          >
            <NavLinks />
          </Suspense>

          {/* Trailing Action: Theme Toggle & Track Order */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle size="md" />

            <div className="hidden sm:flex items-center">
              <Link
                href="/cek-transaksi"
                className="bg-carbon text-white text-xs font-bold uppercase px-4 py-2 rounded-full ink-border hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2 shadow-[2px_2px_0px_0px_#ffd731]"
              >
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span>Lacak Pesanan</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
