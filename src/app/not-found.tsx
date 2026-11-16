import Link from "next/link";
import { ArrowLeft, Home, Search, Compass, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Pop-Brutalist 404 Visual Sticker */}
        <div className="relative inline-block">
          <div className="text-8xl md:text-9xl font-[var(--font-bricolage)] font-black text-[#5c4ade] dark:text-[#ffd731] tracking-tighter drop-shadow-[4px_4px_0px_#000000]">
            404
          </div>
          <div className="absolute -top-3 -right-6 rotate-12 bg-[#ff4d4d] text-white px-3 py-1 rounded-full text-xs font-black uppercase ink-border shadow-[2px_2px_0px_#000000] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>LOST IN VOID</span>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="font-[var(--font-bricolage)] text-2xl md:text-3xl font-black uppercase text-carbon dark:text-white">
            Waduh, Halaman Tidak Ditemukan!
          </h1>
          <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
            Halaman atau produk yang kamu cari mungkin sudah dipindahkan, berganti nama, atau sedang tidak tersedia.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-[#20202e] text-carbon dark:text-white rounded-2xl ink-border text-xs font-black uppercase shadow-[3px_3px_0px_#000000] hover:bg-gray-100 dark:hover:bg-gray-800 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/katalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ffd731] hover:bg-[#ffe366] text-black rounded-2xl ink-border text-xs font-black uppercase shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Compass className="w-4 h-4 stroke-[2.5]" />
            <span>Jelajahi Katalog</span>
          </Link>
        </div>

        {/* Footer Hint */}
        <div className="pt-4 text-[11px] font-bold text-gray-400">
          Butuh bantuan pesanan? Cek status di menu{" "}
          <Link href="/cek-transaksi" className="underline font-black text-[#5c4ade] dark:text-[#ffd731]">
            Lacak Transaksi
          </Link>
        </div>
      </div>
    </div>
  );
}
