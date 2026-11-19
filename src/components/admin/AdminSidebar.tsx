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
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from "@/components/ThemeProvider";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
      label: "Produk & Paket",
      href: "/admin/produk",
      icon: Package,
      active: pathname.startsWith("/admin/produk"),
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

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#161622] border-r-2 border-carbon dark:border-[#38384a] flex flex-col justify-between p-4 sm:p-5 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <BrandLogo />
            </Link>

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
          <div className="p-3 bg-[#ffd731] ink-border rounded-xl flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-black shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase text-black leading-tight">
                  Super Admin
                </p>
                <p className="text-[9px] font-bold text-black/75">XYZPEDIA Manager</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#55db9c] ink-border animate-pulse" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 pb-1">
              Menu Navigasi
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl ink-border text-xs font-black uppercase tracking-wider transition-all duration-150 ${
                    item.active
                      ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[3px_3px_0px_0px_#ffd731] -translate-x-0.5 -translate-y-0.5"
                      : "bg-[#fbfbfd] text-carbon hover:bg-gray-100 dark:bg-[#1f1f2e] dark:text-gray-200 dark:hover:bg-[#28283c] dark:border-[#38384a]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black ink-border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
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
        </div>
      </aside>
    </>
  );
}
