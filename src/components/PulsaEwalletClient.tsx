"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { isProductOutOfStock } from "@/lib/stock";
import {
  Smartphone,
  Wallet,
  Search,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug?: string;
  developer: string | null;
  thumbnailUrl: string;
  badgeText: string | null;
  badgeColor: string | null;
  items: { price: number; stockStatus: string }[];
}

interface PulsaEwalletClientProps {
  products: Product[];
}

// Indonesian Phone Prefix Detection
const OPERATOR_PREFIXES: Record<string, { name: string; slug: string }> = {
  // Telkomsel
  "0811": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  "0812": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  "0813": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  "0821": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  "0822": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  "0823": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  "0852": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  "0853": { name: "Telkomsel", slug: "pulsa-telkomsel" },
  // by.U
  "0851": { name: "by.U", slug: "pulsa-byu" },
  // Indosat
  "0814": { name: "Indosat IM3", slug: "pulsa-indosat" },
  "0815": { name: "Indosat IM3", slug: "pulsa-indosat" },
  "0816": { name: "Indosat IM3", slug: "pulsa-indosat" },
  "0855": { name: "Indosat IM3", slug: "pulsa-indosat" },
  "0856": { name: "Indosat IM3", slug: "pulsa-indosat" },
  "0857": { name: "Indosat IM3", slug: "pulsa-indosat" },
  "0858": { name: "Indosat IM3", slug: "pulsa-indosat" },
  // XL
  "0817": { name: "XL Axiata", slug: "pulsa-xl" },
  "0818": { name: "XL Axiata", slug: "pulsa-xl" },
  "0819": { name: "XL Axiata", slug: "pulsa-xl" },
  "0859": { name: "XL Axiata", slug: "pulsa-xl" },
  "0877": { name: "XL Axiata", slug: "pulsa-xl" },
  "0878": { name: "XL Axiata", slug: "pulsa-xl" },
  // Axis
  "0831": { name: "Axis", slug: "pulsa-axis" },
  "0832": { name: "Axis", slug: "pulsa-axis" },
  "0833": { name: "Axis", slug: "pulsa-axis" },
  "0838": { name: "Axis", slug: "pulsa-axis" },
  // Tri
  "0895": { name: "Tri (3)", slug: "pulsa-tri" },
  "0896": { name: "Tri (3)", slug: "pulsa-tri" },
  "0897": { name: "Tri (3)", slug: "pulsa-tri" },
  "0898": { name: "Tri (3)", slug: "pulsa-tri" },
  "0899": { name: "Tri (3)", slug: "pulsa-tri" },
  // Smartfren
  "0881": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0882": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0883": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0884": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0885": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0886": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0887": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0888": { name: "Smartfren", slug: "pulsa-smartfren" },
  "0889": { name: "Smartfren", slug: "pulsa-smartfren" },
};

export default function PulsaEwalletClient({ products }: PulsaEwalletClientProps) {
  const [filterType, setFilterType] = useState<"all" | "pulsa" | "ewallet">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputPhone, setInputPhone] = useState("");

  // Detect Operator from Phone Prefix
  const detectedOperator = useMemo(() => {
    const clean = inputPhone.replace(/\D/g, "");
    if (clean.length >= 4) {
      const prefix = clean.substring(0, 4);
      return OPERATOR_PREFIXES[prefix] || null;
    }
    return null;
  }, [inputPhone]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      // Type Filter
      if (filterType === "pulsa" && !p.slug.startsWith("pulsa-")) return false;
      if (filterType === "ewallet" && !p.slug.startsWith("saldo-")) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDev = p.developer?.toLowerCase().includes(q);
        return matchName || matchDev;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      const aOut = isProductOutOfStock(a) ? 1 : 0;
      const bOut = isProductOutOfStock(b) ? 1 : 0;
      if (aOut !== bOut) return aOut - bOut;
      return a.name.localeCompare(b.name, "id");
    });
  }, [products, filterType, searchQuery]);

  const pulsaCount = products.filter((p) => p.slug.startsWith("pulsa-")).length;
  const ewalletCount = products.filter((p) => p.slug.startsWith("saldo-")).length;

  return (
    <div className="space-y-8 md:space-y-10">
      {/* 1. HERO BANNER */}
      <section className="bg-[#ffd731] ink-border rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#ffdad6] rounded-full ink-border opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-[var(--font-bricolage)] uppercase text-carbon leading-tight">
            Pulsa & E-Wallet Instan
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-bold text-carbon/90 leading-relaxed">
            Isi ulang pulsa reguler semua operator seluler dan top up saldo dompet digital (DANA, GoPay, OVO, ShopeePay, LinkAja) dengan harga agen tangan pertama dan masuk dalam hitungan detik.
          </p>
        </div>
      </section>

      {/* 2. SMART PHONE NUMBER OPERATOR DETECTOR */}
      <section className="bg-white ink-border rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0px_0px_#000000] space-y-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-[#fb4903]" />
          <h2 className="text-sm sm:text-base font-black uppercase text-carbon font-[var(--font-bricolage)]">
            Cek Operator Otomatis (Ketik Nomor HP)
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="tel"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              placeholder="Ketik 4 digit awal: 0812..., 0857..."
              maxLength={14}
              className="w-full px-4 py-2.5 bg-[#f3f4f6] rounded-xl ink-border text-xs font-bold text-carbon placeholder:text-gray-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>

          {detectedOperator ? (
            <Link
              href={`/produk/${detectedOperator.slug}`}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#55db9c] text-carbon ink-border text-xs font-black uppercase tracking-wider flex items-center justify-between sm:justify-start gap-2 shadow-[2px_2px_0px_0px_#000000] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Operator Terdeteksi: <strong>{detectedOperator.name}</strong></span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : inputPhone.length >= 4 ? (
            <span className="text-xs font-bold text-gray-500">
              Prefix belum dikenali, silakan pilih manual dari daftar di bawah.
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-400 hidden sm:inline">
              Ketik awalan nomor telepon untuk mendeteksi operator Anda secara otomatis.
            </span>
          )}
        </div>
      </section>

      {/* 3. FILTER TABS & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                filterType === "all"
                  ? "bg-carbon text-white shadow-[2.5px_2.5px_0px_0px_#ffd731] -translate-x-[0.5px] -translate-y-[0.5px]"
                  : "bg-white text-carbon hover:bg-gray-100 shadow-[1.5px_1.5px_0px_0px_#000000]"
              }`}
            >
              <span>⚡ Semua</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${filterType === "all" ? "bg-white text-carbon" : "bg-gray-200 text-gray-700"}`}>
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType("pulsa")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                filterType === "pulsa"
                  ? "bg-[#fb4903] text-white shadow-[2.5px_2.5px_0px_0px_#000000] -translate-x-[0.5px] -translate-y-[0.5px]"
                  : "bg-white text-carbon hover:bg-gray-100 shadow-[1.5px_1.5px_0px_0px_#000000]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pulsa Reguler</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${filterType === "pulsa" ? "bg-white text-[#fb4903]" : "bg-gray-200 text-gray-700"}`}>
                {pulsaCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType("ewallet")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                filterType === "ewallet"
                  ? "bg-[#00a8e8] text-white shadow-[2.5px_2.5px_0px_0px_#000000] -translate-x-[0.5px] -translate-y-[0.5px]"
                  : "bg-white text-carbon hover:bg-gray-100 shadow-[1.5px_1.5px_0px_0px_#000000]"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Dompet Digital</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${filterType === "ewallet" ? "bg-white text-[#00a8e8]" : "bg-gray-200 text-gray-700"}`}>
                {ewalletCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Telkomsel, DANA, GoPay..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a28] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#fb4903] shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>
        </div>

        {/* 4. PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-12 text-center space-y-3 shadow-[3px_3px_0px_0px_#000000]">
            <p className="text-3xl">🔍</p>
            <h3 className="text-base font-black text-carbon dark:text-white font-[var(--font-bricolage)] uppercase">
              Layanan Tidak Ditemukan
            </h3>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Tidak ada produk pulsa atau e-wallet yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba cari operator lain.
            </p>
          </div>
        )}
      </div>

      {/* 5. VALUE PROPOSITION CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-[#dceeff] dark:bg-[#152338] ink-border dark:border-[#2d3f5e] rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000000] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1f293d] ink-border dark:border-[#3b5275] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#005ea5] dark:text-[#38bdf8]" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
              Injeksi 1-3 Detik
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
              Sistem backend otomatis terhubung langsung ke API Waroengkuy server pulsa 24 jam.
            </p>
          </div>
        </div>

        <div className="bg-[#e9ccff] dark:bg-[#231535] ink-border dark:border-[#4a286e] rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000000] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2d1c44] ink-border dark:border-[#5a3285] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#6b21a8] dark:text-[#c084fc]" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
              Harga Resmi & Termurah
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
              Harga langsung tersinkronisasi 1:1 dari provider tanpa markup tersembunyi.
            </p>
          </div>
        </div>

        <div className="bg-[#55db9c] dark:bg-[#102e1f] ink-border dark:border-[#1d5c3d] rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000000] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#18422d] ink-border dark:border-[#266e4a] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#065f46] dark:text-[#4ade80]" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
              Garansi Transaksi Aman
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mt-1">
              Setiap transaksi dilengkapi bukti invoice resmi dan pelacakan real-time 24/7.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
