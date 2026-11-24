"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Moon,
  Sun,
  X,
  Activity,
  Ticket,
  ScrollText,
  Users,
  Image as ImageIcon,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from "@/components/ThemeProvider";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      window.location.href = "/admin/login";
    }
  };

  const navItems = [
    {
      label: "Ringkasan",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
      badge: "Utama",
      badgeColor: "bg-[#55db9c] text-black",
    },
    {
      label: "Transaksi",
      href: "/admin/transaksi",
      icon: Receipt,
      active: pathname.startsWith("/admin/transaksi"),
      badge: "Live",
      badgeColor: "bg-[#ffd731] text-black",
    },
    {
      label: "Laporan",
      href: "/admin/laporan",
      icon: BarChart3,
      active: pathname.startsWith("/admin/laporan"),
      badge: "Laba",
      badgeColor: "bg-[#55db9c] text-black",
    },
    {
      label: "Produk & Paket",
      href: "/admin/produk",
      icon: Package,
      active: pathname.startsWith("/admin/produk"),
    },
    {
      label: "Banner Promo",
      href: "/admin/banner",
      icon: ImageIcon,
      active: pathname.startsWith("/admin/banner"),
      badge: "Dinamis",
      badgeColor: "bg-[#ffd731] text-black",
    },
    {
      label: "Cek Stok Server",
      href: "/admin/stok",
      icon: Activity,
      active: pathname.startsWith("/admin/stok"),
      badge: "H2H",
      badgeColor: "bg-[#38bdf8] text-black",
    },
    {
      label: "Kondisi Web",
      href: "/admin/kondisi-web",
      icon: ShieldAlert,
      active: pathname.startsWith("/admin/kondisi-web"),
      badge: "Kontrol",
      badgeColor: "bg-[#fb4903] text-white",
    },
    {
      label: "Klaim Garansi",
      href: "/admin/garansi",
      icon: ShieldCheck,
      active: pathname.startsWith("/admin/garansi"),
      badge: "Tiket",
      badgeColor: "bg-[#22c55e] text-white",
    },
    {
      label: "Kupon Promo",
      href: "/admin/kupon",
      icon: Ticket,
      active: pathname.startsWith("/admin/kupon"),
    },
    {
      label: "Pengguna Admin",
      href: "/admin/pengguna",
      icon: Users,
      active: pathname.startsWith("/admin/pengguna"),
    },
    {
      label: "Audit Log",
      href: "/admin/audit",
      icon: ScrollText,
      active: pathname.startsWith("/admin/audit"),
      badge: "Log",
      badgeColor: "bg-[#ffd731] text-black",
    },
    {
      label: "Pengaturan",
      href: "/admin/pengaturan",
      icon: Settings,
      active: pathname.startsWith("/admin/pengaturan"),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container: Fixed height, strictly within viewport */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 h-screen max-h-screen bg-white dark:bg-[#161622] border-r-2 border-carbon dark:border-[#38384a] flex flex-col transition-all duration-300 ${
          isCollapsed ? "lg:w-20 w-64" : "w-64"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header & Admin Role Badge (Fixed shrink-0) */}
        <div className={`shrink-0 ${isCollapsed ? "p-2.5 lg:p-2" : "p-4"} pb-2 space-y-3`}>
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            {isCollapsed ? (
              <div className="w-full flex items-center justify-between lg:justify-center relative group">
                <Link href="/admin" className="flex items-center justify-center">
                  <BrandLogo iconOnly size="md" />
                </Link>
                {/* Desktop Toggle Expand Button on hover or beside */}
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-lg ink-border bg-[#f3f4f6] dark:bg-[#20202e] text-carbon dark:text-white hover:bg-gray-200 dark:hover:bg-[#28283c] transition-colors ml-1"
                  title="Perbesar Sidebar"
                  aria-label="Perbesar Sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/admin" className="flex items-center gap-2">
                  <BrandLogo size="md" />
                </Link>

                {/* Desktop Minimize Button */}
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-lg ink-border bg-[#f3f4f6] dark:bg-[#20202e] text-carbon dark:text-white hover:bg-gray-200 dark:hover:bg-[#28283c] transition-colors cursor-pointer"
                  title="Perkecil Sidebar"
                  aria-label="Perkecil Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg ink-border bg-[#f3f4f6] dark:bg-[#20202e] text-carbon dark:text-white cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Role Pill */}
          {isCollapsed ? (
            <div className="relative group flex items-center justify-center">
              <div className="w-10 h-10 bg-[#ffd731] ink-border rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] relative cursor-pointer p-1">
                <img
                  src="/brand/logo/xyzpedia-maskot.svg"
                  alt="XYZI Mascot"
                  className="w-full h-full object-contain"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#55db9c] ink-border animate-pulse" />
              </div>
              {/* Tooltip */}
              <div className="hidden lg:flex absolute left-full ml-3 px-3 py-1.5 bg-[#12121a] dark:bg-[#222234] text-white rounded-xl text-xs font-black uppercase whitespace-nowrap shadow-[3px_3px_0px_0px_#000000] border-2 border-carbon dark:border-[#38384a] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Super Admin (XYZPEDIA Manager)
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-carbon dark:border-r-[#38384a]" />
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-[#ffd731] ink-border rounded-xl flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                  <img
                    src="/brand/logo/xyzpedia-maskot.svg"
                    alt="XYZI Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-black leading-tight">
                    Super Admin
                  </p>
                  <p className="text-[9px] font-bold text-black/75">XYZPEDIA Manager</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#55db9c] ink-border animate-pulse" />
            </div>
          )}
        </div>

        {/* Scrollable Navigation Links (Middle flex-1 min-h-0) */}
        <div className={`flex-1 min-h-0 overflow-y-auto ${isCollapsed ? "px-2" : "px-4"} py-1 custom-scrollbar`}>
          <nav className="space-y-1.5">
            {!isCollapsed && (
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 px-2 pb-1">
                Menu Navigasi
              </p>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  className={`relative group flex items-center ${
                    isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
                  } rounded-xl ink-border text-xs font-black uppercase tracking-wider transition-all duration-150 ${
                    item.active
                      ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731] -translate-x-0.5 -translate-y-0.5"
                      : "bg-[#fbfbfd] text-carbon hover:bg-gray-100 dark:bg-[#1f1f2e] dark:text-gray-200 dark:hover:bg-[#28283c] dark:border-[#38384a]"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black ink-border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed Hover Tooltip with Arrow */}
                  {isCollapsed && (
                    <div className="hidden lg:flex absolute left-full ml-3 px-3 py-1.5 bg-[#12121a] dark:bg-[#222234] text-white rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-[4px_4px_0px_0px_#000000] border-2 border-carbon dark:border-[#38384a] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-black ink-border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-carbon dark:border-r-[#38384a]" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Fixed Footer Area (Never pushed off screen) */}
        <div className={`shrink-0 ${isCollapsed ? "p-2 space-y-2" : "p-4 space-y-2"} pt-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161622]`}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              {/* Buka Toko Collapsed */}
              <Link
                href="/"
                target="_blank"
                className="relative group p-2.5 bg-[#dceeff] dark:bg-[#152338] ink-border dark:border-[#2d3f5e] rounded-xl text-[#003a6b] dark:text-[#bae6fd] hover:brightness-105 transition-all shadow-[1.5px_1.5px_0px_0px_#000000] flex items-center justify-center w-full"
                aria-label="Buka Toko"
              >
                <ExternalLink className="w-4 h-4" />
                <div className="hidden lg:flex absolute left-full ml-3 px-3 py-1.5 bg-[#12121a] dark:bg-[#222234] text-white rounded-xl text-xs font-black uppercase whitespace-nowrap shadow-[3px_3px_0px_0px_#000000] border-2 border-carbon dark:border-[#38384a] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Buka Toko
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-carbon dark:border-r-[#38384a]" />
                </div>
              </Link>

              {/* Theme Collapsed */}
              <button
                type="button"
                onClick={toggleTheme}
                className="relative group p-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-carbon dark:text-white hover:bg-gray-200 dark:hover:bg-[#2b2b3d] transition-colors cursor-pointer flex items-center justify-center w-full"
                aria-label="Ubah Tema"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-[#ffd731]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#5c4ade]" />
                )}
                <div className="hidden lg:flex absolute left-full ml-3 px-3 py-1.5 bg-[#12121a] dark:bg-[#222234] text-white rounded-xl text-xs font-black uppercase whitespace-nowrap shadow-[3px_3px_0px_0px_#000000] border-2 border-carbon dark:border-[#38384a] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-carbon dark:border-r-[#38384a]" />
                </div>
              </button>

              {/* Logout Collapsed */}
              <button
                type="button"
                onClick={handleLogout}
                className="relative group p-2.5 bg-[#ffdad6] dark:bg-[#3d141a] rounded-xl ink-border dark:border-[#5c1d28] text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000000] flex items-center justify-center w-full"
                aria-label="Keluar Admin"
              >
                <LogOut className="w-4 h-4" />
                <div className="hidden lg:flex absolute left-full ml-3 px-3 py-1.5 bg-[#12121a] dark:bg-[#222234] text-white rounded-xl text-xs font-black uppercase whitespace-nowrap shadow-[3px_3px_0px_0px_#000000] border-2 border-carbon dark:border-[#38384a] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Keluar Admin
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-carbon dark:border-r-[#38384a]" />
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Quick storefront link */}
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3 py-2 bg-[#dceeff] dark:bg-[#152338] ink-border dark:border-[#2d3f5e] rounded-xl text-xs font-bold text-[#003a6b] dark:text-[#bae6fd] hover:brightness-105 transition-all shadow-[1.5px_1.5px_0px_0px_#000000]"
              >
                <span className="flex items-center gap-2">
                  <span>Buka Toko</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Theme & Logout Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex-1 py-2 px-3 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-black uppercase tracking-wider text-carbon dark:text-white flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-[#2b2b3d] transition-colors cursor-pointer"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#ffd731]" />
                      <span>Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#5c4ade]" />
                      <span>Gelap</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 bg-[#ffdad6] dark:bg-[#3d141a] rounded-xl ink-border dark:border-[#5c1d28] text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000000]"
                  title="Keluar Admin"
                  aria-label="Keluar Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
