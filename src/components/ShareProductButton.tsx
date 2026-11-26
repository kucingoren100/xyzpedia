"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareProductButtonProps {
  productName: string;
}

export default function ShareProductButton({ productName }: ShareProductButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${productName} — XYZPEDIA`,
          text: `Cek ${productName} proses instan 24 jam di XYZPEDIA!`,
          url,
        });
        return;
      } catch {
        // User cancelled or share unsupported, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Bagikan halaman produk ini"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1f1f2e] text-carbon dark:text-white hover:bg-[#ffd731] dark:hover:bg-[#ffd731] hover:text-black dark:hover:text-black ink-border dark:border-[#38384a] rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000] transition-colors cursor-pointer shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
          <span>Link Disalin!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Bagikan</span>
        </>
      )}
    </button>
  );
}
