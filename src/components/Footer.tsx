"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

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
      <div className="w-full px-4 sm:px-6 md:px-8 py-12 max-w-6xl mx-auto flex flex-col gap-8">
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
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-[#ffd731] text-black px-3.5 py-1.5 rounded-lg ink-border text-xs font-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>QRIS Instan 24 Jam</span>
              </div>
              <div className="bg-[#20202e] text-[#d6d6e6] px-3.5 py-1.5 rounded-lg border border-[#38384d] text-xs font-bold flex items-center gap-2">
                <span className="text-[#ffd731]">✓</span>
                <span>Support Semua Bank &amp; E-Wallet (BCA, Mandiri, BRI, BNI, GoPay, DANA, ShopeePay, OVO, dll)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/20">
          <span className="text-xs text-[#e9e9e9] block uppercase font-bold tracking-wider">
            Media Sosial Resmi
          </span>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Instagram Top Up */}
            <a
              href="https://instagram.com/xyzpedia.topup"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 bg-[#20202e] hover:bg-[#E1306C] text-white rounded-xl ink-border border-[#38384d] hover:border-[#E1306C] text-xs font-bold transition-all shadow-[2px_2px_0px_0px_#000000] hover:scale-102 active:scale-98 cursor-pointer"
              title="Instagram Top Up: @xyzpedia.topup"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0 shadow-sm">
                <InstagramIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9.5px] text-gray-400 group-hover:text-white/80 font-normal">IG Top Up</span>
                <span className="text-xs font-black">@xyzpedia.topup</span>
              </div>
            </a>

            {/* Instagram Akun Premium */}
            <a
              href="https://instagram.com/xyzpedia.premium"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 bg-[#20202e] hover:bg-[#833AB4] text-white rounded-xl ink-border border-[#38384d] hover:border-[#833AB4] text-xs font-bold transition-all shadow-[2px_2px_0px_0px_#000000] hover:scale-102 active:scale-98 cursor-pointer"
              title="Instagram Akun Premium: @xyzpedia.premium"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white shrink-0 shadow-sm">
                <InstagramIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9.5px] text-gray-400 group-hover:text-white/80 font-normal">IG Akun Premium</span>
                <span className="text-xs font-black">@xyzpedia.premium</span>
              </div>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@xyzpedia_"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 bg-[#20202e] hover:bg-black text-white rounded-xl ink-border border-[#38384d] hover:border-white text-xs font-bold transition-all shadow-[2px_2px_0px_0px_#000000] hover:scale-102 active:scale-98 cursor-pointer"
              title="TikTok: @xyzpedia_"
            >
              <div className="w-6 h-6 rounded-lg bg-[#010101] border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm">
                <TikTokIcon className="w-3.5 h-3.5 text-[#25F4EE]" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9.5px] text-gray-400 group-hover:text-white/80 font-normal">TikTok</span>
                <span className="text-xs font-black">xyzpedia_</span>
              </div>
            </a>

            {/* Website */}
            <a
              href="https://www.xyzpedia.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 bg-[#20202e] hover:bg-[#ffd731] hover:text-black text-white rounded-xl ink-border border-[#38384d] hover:border-[#ffd731] text-xs font-bold transition-all shadow-[2px_2px_0px_0px_#000000] hover:scale-102 active:scale-98 cursor-pointer"
              title="Website Resmi: xyzpedia.my.id"
            >
              <div className="w-6 h-6 rounded-lg bg-[#ffd731] flex items-center justify-center text-black shrink-0 shadow-sm">
                <GlobeIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9.5px] text-gray-400 group-hover:text-black/80 font-normal">Website</span>
                <span className="text-xs font-black">xyzpedia.my.id</span>
              </div>
            </a>
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
