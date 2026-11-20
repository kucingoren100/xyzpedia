"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { isProductOutOfStock, sortProductsByAvailability } from "@/lib/stock";
import { fuzzySearchProducts } from "@/lib/searchHelper";
import Link from "next/link";
import {
  Gamepad2,
  Tv,
  Ticket,
  Search,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Smartphone,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  badge?: string | null;
  order?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  developer?: string | null;
  thumbnailUrl: string;
  badgeText?: string | null;
  badgeColor?: string | null;
  isPopular: boolean;
  items: { price: number; stockStatus?: string }[];
}

interface StorefrontClientProps {
  categories: Category[];
  products: Product[];
}

export default function StorefrontClient({ categories, products }: StorefrontClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trackerInvoice, setTrackerInvoice] = useState("");

  const filteredProducts = useMemo(() => {
    const categoryFiltered = products.filter((p) => {
      return selectedCategory === "all" || p.categorySlug === selectedCategory;
    });

    const list = searchQuery.trim()
      ? fuzzySearchProducts(categoryFiltered, searchQuery)
      : categoryFiltered;

    const categoryOrderMap = new Map<string, number>();
    categories.forEach((c, idx) => {
      categoryOrderMap.set(c.slug, c.order ?? (idx + 1));
    });

    return [...list].sort((a, b) => {
      // 1. Available products first, out-of-stock / unavailable products at the bottom
      const aOut = isProductOutOfStock(a) ? 1 : 0;
      const bOut = isProductOutOfStock(b) ? 1 : 0;
      if (aOut !== bOut) return aOut - bOut;

      // 2. Category order (when in "all")
      if (selectedCategory === "all") {
        const orderA = categoryOrderMap.get(a.categorySlug) ?? 99;
        const orderB = categoryOrderMap.get(b.categorySlug) ?? 99;
        if (orderA !== orderB) return orderA - orderB;
      }

      // 3. Alphabetical name
      return a.name.localeCompare(b.name, "id");
    });
  }, [products, selectedCategory, searchQuery, categories]);

  const gameProducts = useMemo(
    () =>
      sortProductsByAvailability(
        products.filter((p) => p.categorySlug === "game-topup")
      ),
    [products]
  );

  const subscriptionProducts = useMemo(
    () =>
      sortProductsByAvailability(
        products.filter(
          (p) =>
            p.categorySlug === "akun-premium" ||
            p.categorySlug === "voucher-digital"
        )
      ),
    [products]
  );

  const handleTrackerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackerInvoice.trim()) {
      window.location.href = `/cek-transaksi?q=${encodeURIComponent(trackerInvoice.trim())}`;
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. CATEGORY TILES (Stitch 4-Color Pastel Blocks) */}
      <section className="space-y-4" id="categories-section">
        <div className="flex justify-between items-baseline">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#fb4903] ink-border" />
            <h2 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)] uppercase">
              Kategori Layanan
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Pilih kategori untuk melihat produk</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Sky Wash (Game Top-Up) */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("game-topup");
              const el = document.getElementById("catalog-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group bg-[#dceeff] rounded-2xl p-4 sm:p-5 ink-border hover:scale-[1.02] transition-transform flex flex-col justify-between min-h-[140px] sm:h-44 relative overflow-hidden text-left shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white ink-border flex items-center justify-center text-black group-hover:rotate-[-6deg] transition-transform">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full ink-border text-[10px] font-black text-black">
                Injeksi
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-black font-[var(--font-bricolage)]">
                Game Top-Up
              </h3>
              <p className="text-[11px] sm:text-xs text-black/80 font-semibold mt-0.5 line-clamp-1">
                Diamonds, UC & Cash
              </p>
            </div>
          </button>

          {/* Card 2: Lavender (Digital Subscriptions) */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("akun-premium");
              const el = document.getElementById("catalog-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group bg-[#e9ccff] rounded-2xl p-4 sm:p-5 ink-border hover:scale-[1.02] transition-transform flex flex-col justify-between min-h-[140px] sm:h-44 relative overflow-hidden text-left shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white ink-border flex items-center justify-center text-black group-hover:rotate-[6deg] transition-transform">
                <Tv className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full ink-border text-[10px] font-black text-black">
                Garansi
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-black font-[var(--font-bricolage)]">
                Akun Premium
              </h3>
              <p className="text-[11px] sm:text-xs text-black/80 font-semibold mt-0.5 line-clamp-1">
                Spotify, Netflix 4K, Canva
              </p>
            </div>
          </button>

          {/* Card 3: Sunburst (Gift Cards & Vouchers) */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("voucher-digital");
              const el = document.getElementById("catalog-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group bg-[#ffd731] rounded-2xl p-4 sm:p-5 ink-border hover:scale-[1.02] transition-transform flex flex-col justify-between min-h-[140px] sm:h-44 relative overflow-hidden text-left shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white ink-border flex items-center justify-center text-black group-hover:rotate-[-6deg] transition-transform">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full ink-border text-[10px] font-black text-black">
                Kode Resmi
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-black font-[var(--font-bricolage)]">
                Voucher Digital
              </h3>
              <p className="text-[11px] sm:text-xs text-black/80 font-semibold mt-0.5 line-clamp-1">
                Steam Wallet, Google Play
              </p>
            </div>
          </button>

          {/* Card 4: Coral Glow (Pulsa & E-Wallet) */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("pulsa-ewallet");
              const el = document.getElementById("catalog-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group bg-[#ffdad6] rounded-2xl p-4 sm:p-5 ink-border hover:scale-[1.02] transition-transform flex flex-col justify-between min-h-[140px] sm:h-44 relative overflow-hidden text-left shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white ink-border flex items-center justify-center text-black group-hover:rotate-[-6deg] transition-transform">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <span className="bg-[#fb4903] text-white px-2 py-0.5 rounded-full ink-border text-[10px] font-black">
                Baru
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-black font-[var(--font-bricolage)]">
                Pulsa & E-Wallet
              </h3>
              <p className="text-[11px] sm:text-xs text-black/80 font-semibold mt-0.5 line-clamp-1">
                Telkomsel, DANA, GoPay, OVO
              </p>
            </div>
          </button>

          {/* Card 5: Mint Pop (All Products) */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              const el = document.getElementById("catalog-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group bg-[#55db9c] rounded-2xl p-4 sm:p-5 ink-border hover:scale-[1.02] transition-transform flex flex-col justify-between min-h-[140px] sm:h-44 relative overflow-hidden text-left shadow-[3px_3px_0px_0px_#000000] col-span-2 sm:col-span-1 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white ink-border flex items-center justify-center text-black group-hover:rotate-[6deg] transition-transform">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <span className="bg-white px-2 py-0.5 rounded-full ink-border text-[10px] font-black text-black">
                Semua
              </span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-black font-[var(--font-bricolage)]">
                Katalog Lengkap
              </h3>
              <p className="text-[11px] sm:text-xs text-black/80 font-semibold mt-0.5 line-clamp-1">
                {products.length}+ Layanan Aktif
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 2. DEDICATED CATALOG FILTER & SEARCH BAR */}
      <div id="catalog-grid" className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#5c4ade] ink-border" />
            <h2 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)] uppercase">
              {selectedCategory === "all"
                ? "Daftar Seluruh Produk"
                : categories.find((c) => c.slug === selectedCategory)?.name || "Katalog Pilihan"}
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari game atau aplikasi..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#20202e] rounded-full ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5c4ade] shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#20202e] dark:text-white dark:hover:bg-[#2b2b3d] dark:border-[#38384a]"
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer ${
                selectedCategory === c.slug
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                  : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#20202e] dark:text-white dark:hover:bg-[#2b2b3d] dark:border-[#38384a]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* 3. ORDER TRACKER BANNER (Stitch Voltage Violet Section) */}
      <section
        className="w-full bg-[#5c4ade] rounded-3xl ink-border p-6 md:p-10 text-white relative overflow-hidden shadow-[4px_4px_0px_0px_#000000]"
        id="order-tracker"
      >
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#4da2ff] ink-border opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-carbon rounded-full ink-border text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
              <Truck className="w-3.5 h-3.5" />
              <span>Status Pesanan Real-Time</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-[var(--font-bricolage)] uppercase leading-tight">
              Sudah Membayar? Lacak Pesananmu Sekarang
            </h3>
            <p className="text-xs sm:text-sm font-semibold opacity-90">
              Cukup masukkan Nomor Invoice atau Email Anda untuk memantau status injeksi diamond atau pengiriman akun premium secara live.
            </p>
          </div>

          {/* Quick Tracking Form */}
          <form
            onSubmit={handleTrackerSubmit}
            className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0"
          >
            <input
              type="text"
              value={trackerInvoice}
              onChange={(e) => setTrackerInvoice(e.target.value)}
              placeholder="Contoh: INV-XYZ-..."
              className="w-full sm:w-auto min-w-0 sm:min-w-[260px] px-4 py-3 bg-white text-carbon rounded-2xl ink-border text-xs font-bold placeholder:text-gray-400 focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#ffd731] text-black rounded-2xl ink-border text-xs font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[3px_3px_0px_0px_#000000]"
            >
              Lacak Pesanan
            </button>
          </form>
        </div>
      </section>

      {/* 4. HOW IT WORKS (Stitch Soft Mist 4-Step Section) */}
      <section
        className="w-full bg-[#e9e9e9] dark:bg-[#161622] rounded-3xl ink-border dark:border-[#38384a] p-6 md:p-8 space-y-6 shadow-[4px_4px_0px_0px_#000000]"
        id="how-it-works-section"
      >
        <div className="flex justify-between items-baseline">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#55db9c] ink-border" />
            <h2 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)] uppercase">
              Cara Pembelian Instan
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">4 Langkah Simpel Tanpa Login</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#20202e] rounded-2xl p-5 ink-border dark:border-[#38384a] shadow-[2px_2px_0px_0px_#000000] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#ffd731] text-black ink-border flex items-center justify-center text-xs font-black">
              1
            </span>
            <h4 className="text-sm font-black text-carbon dark:text-white">Pilih Game / Layanan</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
              Tentukan produk game atau akun langganan premium yang ingin kamu beli.
            </p>
          </div>

          <div className="bg-white dark:bg-[#20202e] rounded-2xl p-5 ink-border dark:border-[#38384a] shadow-[2px_2px_0px_0px_#000000] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#55db9c] text-black ink-border flex items-center justify-center text-xs font-black">
              2
            </span>
            <h4 className="text-sm font-black text-carbon dark:text-white">Isi Data Akun</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
              Masukkan User ID dan Server ID game atau email akunmu secara akurat.
            </p>
          </div>

          <div className="bg-white dark:bg-[#20202e] rounded-2xl p-5 ink-border dark:border-[#38384a] shadow-[2px_2px_0px_0px_#000000] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#4da2ff] text-white ink-border flex items-center justify-center text-xs font-black">
              3
            </span>
            <h4 className="text-sm font-black text-carbon dark:text-white">Scan QRIS Dinamis</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
              Bayar nominal tepat via GoPay, DANA, BCA, BRI, ShopeePay atau bank apa pun.
            </p>
          </div>

          <div className="bg-white dark:bg-[#20202e] rounded-2xl p-5 ink-border dark:border-[#38384a] shadow-[2px_2px_0px_0px_#000000] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#fb4903] text-white ink-border flex items-center justify-center text-xs font-black">
              4
            </span>
            <h4 className="text-sm font-black text-carbon dark:text-white">Pesanan Masuk Otomatis</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
              Dalam 1 - 3 detik setelah pembayaran berhasil, item langsung masuk ke akunmu!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
