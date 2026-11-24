"use client";

import { useEffect, useState, useRef } from "react";
import {
  X,
  Sparkles,
  Megaphone,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StoreAnnouncementsConfig } from "@/types/storeAnnouncements";

const STORAGE_KEY_DAY = "xyzpedia_announcement_seen_date";
const STORAGE_KEY_SESSION = "xyzpedia_announcement_seen_session";

export default function StoreAnnouncementModal() {
  const pathname = usePathname();

  // Hide on admin & receipt pages
  const isAdminOrReceipt =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/struk") ||
    (typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/struk")));

  const [config, setConfig] = useState<StoreAnnouncementsConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ad" | "announcement">("ad");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [dontShowToday, setDontShowToday] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch announcements config
  useEffect(() => {
    if (isAdminOrReceipt) return;

    fetch("/api/public/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          const cfg: StoreAnnouncementsConfig = data.config;
          const hasAd = Boolean(cfg.popupAd?.isActive);
          const hasAnn = Boolean(cfg.popupAnnouncement?.isActive);

          if (!hasAd && !hasAnn) return;

          // Check if dismissed for today
          try {
            const lastSeenDay = localStorage.getItem(STORAGE_KEY_DAY);
            if (lastSeenDay) {
              const date = new Date(parseInt(lastSeenDay, 10));
              const now = new Date();
              if (
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
              ) {
                return;
              }
            }

            // Check if dismissed in this current browser session
            const seenSession = sessionStorage.getItem(STORAGE_KEY_SESSION);
            if (seenSession === "true") {
              return;
            }
          } catch {
            // ignore
          }

          setConfig(cfg);
          setActiveTab(hasAd ? "ad" : "announcement");

          // Open after 1.2s smooth delay
          const openTimer = setTimeout(() => {
            setIsOpen(true);
          }, 1200);

          return () => clearTimeout(openTimer);
        }
      })
      .catch(() => {});
  }, [isAdminOrReceipt]);

  // Handle countdown timer based on active tab
  useEffect(() => {
    if (!isOpen || !config) return;

    const currentAutoClose =
      activeTab === "ad"
        ? config.popupAd.autoCloseSeconds
        : config.popupAnnouncement.autoCloseSeconds;

    if (currentAutoClose && currentAutoClose > 0) {
      setCountdown(currentAutoClose);
      setTotalSeconds(currentAutoClose);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsOpen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      setCountdown(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, activeTab, config]);

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      sessionStorage.setItem(STORAGE_KEY_SESSION, "true");
      if (dontShowToday) {
        localStorage.setItem(STORAGE_KEY_DAY, Date.now().toString());
      }
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (isAdminOrReceipt || !isOpen || !config) {
    return null;
  }

  const hasAd = Boolean(config.popupAd?.isActive);
  const hasAnn = Boolean(config.popupAnnouncement?.isActive);

  if (!hasAd && !hasAnn) return null;

  const currentTab = activeTab === "ad" && hasAd ? "ad" : "announcement";
  const progressPercent =
    totalSeconds > 0 && countdown !== null
      ? Math.max(0, Math.min(100, (countdown / totalSeconds) * 100))
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#181824] ink-border rounded-3xl shadow-[8px_8px_0px_#000000] overflow-hidden space-y-4 p-5 sm:p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar Timer Countdown */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                currentTab === "ad" ? "bg-[#fb4903]" : "bg-[#ffd731]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Header: Tabs (if both active) or Badges & Close Button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {hasAd && hasAnn ? (
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#202030] rounded-xl ink-border text-[11px] font-black">
              <button
                type="button"
                onClick={() => setActiveTab("ad")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  currentTab === "ad"
                    ? "bg-[#fb4903] text-white shadow-xs"
                    : "text-gray-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Promo Spesial</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("announcement")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  currentTab === "announcement"
                    ? "bg-[#ffd731] text-black shadow-xs"
                    : "text-gray-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <Megaphone className="w-3 h-3" />
                <span>Pengumuman</span>
              </button>
            </div>
          ) : currentTab === "ad" ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fb4903] text-white font-black text-[11px] uppercase rounded-full ink-border shadow-[2px_2px_0px_#000000]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.popupAd.subtitle || "PROMO SPESIAL TOKO"}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffd731] text-black font-black text-[11px] uppercase rounded-full ink-border shadow-[2px_2px_0px_#000000]">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Pemberitahuan Resmi Toko</span>
            </div>
          )}

          {/* Close Button X */}
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#252538] dark:hover:bg-[#34344d] flex items-center justify-center text-gray-500 hover:text-carbon dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Content Mode: Iklan Promo */}
        {currentTab === "ad" ? (
          <div className="space-y-4">
            {/* Banner Image */}
            {config.popupAd.imageUrl ? (
              <div className="w-full h-40 sm:h-48 rounded-2xl overflow-hidden ink-border bg-gray-900 shadow-[2px_2px_0px_#000000]">
                <img
                  src={config.popupAd.imageUrl}
                  alt={config.popupAd.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white leading-tight">
                {config.popupAd.title}
              </h3>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {config.popupAd.description}
              </p>
            </div>

            {/* Countdown info */}
            {countdown !== null && countdown > 0 && (
              <div className="text-[11px] font-bold text-orange-500 dark:text-orange-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Otomatis tertutup dalam {countdown} detik</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#32324a] text-carbon dark:text-white rounded-2xl ink-border text-xs font-black uppercase transition-colors cursor-pointer shrink-0"
              >
                Lewati
              </button>
              <Link
                href={config.popupAd.actionUrl || "/katalog"}
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-[#fb4903] hover:bg-[#e03f00] text-white font-black text-xs uppercase rounded-2xl ink-border shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 transition-transform active:translate-y-0.5"
              >
                <span>{config.popupAd.actionText || "Ambil Promo Sekarang"}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        ) : (
          /* Content Mode: Pengumuman Toko */
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ffd731] text-black flex items-center justify-center ink-border shadow-[2px_2px_0px_#000000]">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white leading-tight">
                {config.popupAnnouncement.title}
              </h3>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {config.popupAnnouncement.message}
              </p>
            </div>

            {/* Countdown info */}
            {countdown !== null && countdown > 0 && (
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Otomatis tertutup dalam {countdown} detik</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#32324a] text-carbon dark:text-white rounded-2xl ink-border text-xs font-black uppercase transition-colors cursor-pointer shrink-0"
              >
                Tutup
              </button>
              {config.popupAnnouncement.actionUrl ? (
                <Link
                  href={config.popupAnnouncement.actionUrl}
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-[#ffd731] hover:bg-[#ffe066] text-black font-black text-xs uppercase rounded-2xl ink-border shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 transition-transform active:translate-y-0.5"
                >
                  <span>
                    {config.popupAnnouncement.actionText || "Lihat Selengkapnya"}
                  </span>
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                </Link>
              ) : null}
            </div>
          </div>
        )}

        {/* Checkbox Jangan tampilkan lagi hari ini */}
        <div className="pt-1 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-center">
          <label className="text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#fb4903] rounded cursor-pointer"
            />
            <span>Jangan tampilkan lagi hari ini</span>
          </label>
        </div>
      </div>
    </div>
  );
}
