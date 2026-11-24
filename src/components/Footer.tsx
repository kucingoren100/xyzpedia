"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  const pathname = usePathname();

  // Hide storefront footer on admin pages & struk receipt page
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
    <footer className="w-full bg-carbon text-white border-t border-carbon mt-16">
      <div className="w-full px-4 md:px-8 py-12 max-w-[1440px] mx-auto flex flex-col gap-8">
        {/* Top Row: Brand & Payment Matrix */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 pb-8 border-b border-white/20">
          
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-3">
              <BrandLogo asLink href="/" size="md" theme="dark" />
              <div className="w-10 h-10 shrink-0 transform -rotate-6 hover:rotate-0 transition-transform">
                <img
                  src="/brand/stiker/xyzi-stiker-oke.png"
                  alt="XYZI Maskot"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
            </div>

            <p className="text-xs text-[#e9e9e9] font-medium leading-relaxed">
              Platform direct-fulfillment digital terkemuka untuk top up game, voucher, dan langganan premium instan. Transaksi guest langsung tanpa wajib login akun.
            </p>
          </div>

          {/* Payment Method Badges Row */}
          <div className="space-y-3">
            <span className="text-xs text-[#e9e9e9] block uppercase font-bold tracking-wider">
              Metode Pembayaran Resmi (0% Biaya Admin)
            </span>
            <div className="flex flex-wrap gap-2">
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-black shadow-[2px_2px_0px_0px_#ffd731]">
                QRIS Instant
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                BCA
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                Mandiri
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                BRI
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                BNI
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                GoPay
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                DANA
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                ShopeePay
              </div>
              <div className="bg-white text-carbon px-3 py-1.5 rounded-lg ink-border text-xs font-bold">
                OVO
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/" className="text-[#ffd731] hover:underline">
              Beranda
            </Link>
            <Link href="/katalog" className="text-gray-300 hover:text-white transition-colors">
              Semua Katalog
            </Link>
            <Link href="/katalog?cat=pulsa-ewallet" className="text-gray-300 hover:text-white transition-colors">
              Pulsa & E-Wallet
            </Link>
            <Link href="/cek-transaksi" className="text-gray-300 hover:text-white transition-colors">
              Lacak Pesanan
            </Link>
            <Link href="/bantuan" className="text-gray-300 hover:text-white transition-colors">
              Pusat Bantuan & FAQ
            </Link>
            <Link href="/kebijakan" className="text-gray-300 hover:text-white transition-colors">
              Kebijakan dan Privasi
            </Link>
          </div>

          <div className="text-gray-400 text-[11px] font-mono">
            QiosPay QRIS Dynamic Gateway Engine • ISO/IEC 27001
          </div>
        </div>

        {/* Bottom Row: Copyright */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 text-center sm:text-left">
          <p>© 2026 XYZPEDIA. Direct Fulfillment & Top-Up Engine. All rights reserved.</p>
          <p className="text-[11px]">Designed with Pop-Brutalism Stitch System</p>
        </div>
      </div>
    </footer>
  );
}
