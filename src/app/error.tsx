"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5] rounded-3xl ink-border shadow-[4px_4px_0px_#000000]">
          <AlertCircle className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="font-[var(--font-bricolage)] text-2xl md:text-3xl font-black uppercase text-carbon dark:text-white">
            Terjadi Kesalahan Sistem
          </h2>
          <p className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
            Maaf cuy, server kami mengalami sedikit kendala teknis saat memproses permintaanmu. Silakan coba muat ulang halaman.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#55db9c] hover:bg-[#48c78d] text-black rounded-2xl ink-border text-xs font-black uppercase shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Coba Muat Ulang</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-[#20202e] text-carbon dark:text-white rounded-2xl ink-border text-xs font-black uppercase shadow-[3px_3px_0px_#000000] hover:bg-gray-100 dark:hover:bg-gray-800 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
