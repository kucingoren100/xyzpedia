"use client";

import { useState, useEffect } from "react";
import { Menu, Zap } from "lucide-react";
import { useAdminSidebar } from "./AdminLayoutClient";

interface AdminTopbarProps {
  onOpenSidebar?: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminTopbar({ onOpenSidebar, title = "Dashboard Admin", subtitle }: AdminTopbarProps) {
  const { openSidebar } = useAdminSidebar();
  const [currentTime, setCurrentTime] = useState("");

  const handleOpen = () => {
    if (onOpenSidebar) {
      onOpenSidebar();
    } else {
      openSidebar();
    }
  };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Jakarta",
        }) + " WIB"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#161622]/95 backdrop-blur-md border-b-2 border-carbon dark:border-[#38384a] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={handleOpen}
          className="lg:hidden p-2 rounded-xl ink-border bg-[#f3f4f6] dark:bg-[#20202e] text-carbon dark:text-white cursor-pointer hover:bg-gray-200"
          aria-label="Buka Menu Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-[var(--font-bricolage)] text-lg sm:text-xl font-black uppercase text-carbon dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#f3f4f6] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-full text-xs font-black text-carbon dark:text-white shadow-[1px_1px_0px_0px_#000000]">
          <span className="w-2 h-2 rounded-full bg-[#55db9c] animate-pulse" />
          <span>{currentTime || "Live WIB"}</span>
        </div>

        {/* Server Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ffd731] text-black ink-border rounded-full text-[11px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000]">
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>Sistem Aktif</span>
        </div>
      </div>
    </header>
  );
}
