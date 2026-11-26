"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import { isProductOutOfStock, sortProductsByAvailability } from "@/lib/stock";
import { fuzzySearchProducts } from "@/lib/searchHelper";
import {
  Search,
  Zap,
  Gamepad2,
  Tv,
  Ticket,
  Smartphone,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

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

interface KatalogClientProps {
  categories: Category[];
  products: Product[];
}

// Indonesian Phone Prefix Detection for Pulsa & E-Wallet
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

export default function KatalogClient({ categories, products }: KatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCat = searchParams.get("cat") || "all";
  const initialQ = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>(initialQ);
  const [pulsaSubFilter, setPulsaSubFilter] = useState<"all" | "pulsa" | "ewallet">("all");
  const [inputPhone, setInputPhone] = useState<string>("");

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get("cat");
    const q = searchParams.get("q");
    if (cat) setSelectedCategory(cat);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setPulsaSubFilter("all");
    setInputPhone("");
    // Clean URL without adding #
    const params = new URLSearchParams();
    if (slug !== "all") params.set("cat", slug);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const queryString = params.toString();
    router.replace(`/katalog${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("cat", selectedCategory);
    if (value.trim()) params.set("q", value.trim());
    const queryString = params.toString();
    router.replace(`/katalog${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const handleQuickChip = (keyword: string) => {
    if (searchQuery.toLowerCase() === keyword.toLowerCase()) {
      handleSearchChange("");
    } else {
      handleSearchChange(keyword);
    }
  };

  // Detected Operator for Pulsa
  const detectedOperator = useMemo(() => {
    const clean = inputPhone.replace(/\D/g, "");
    if (clean.length >= 4) {
      const prefix = clean.substring(0, 4);
      return OPERATOR_PREFIXES[prefix] || null;
    }
    return null;
  }, [inputPhone]);

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
        products.filter((p) => p.categorySlug === "akun-premium")
      ),
    [products]
  );
  const voucherProducts = useMemo(
    () =>
      sortProductsByAvailability(
        products.filter((p) => p.categorySlug === "voucher-digital")
      ),
    [products]
  );
  const pulsaProducts = useMemo(
    () =>
      sortProductsByAvailability(
        products.filter((p) => p.categorySlug === "pulsa-ewallet")
      ),
    [products]
  );

  const displayProducts = useMemo(() => {
    if (selectedCategory === "pulsa-ewallet") {
      let result = filteredProducts;
      if (pulsaSubFilter === "pulsa") {
        result = result.filter((p) => p.slug.startsWith("pulsa-"));
      } else if (pulsaSubFilter === "ewallet") {
        result = result.filter((p) => p.slug.startsWith("saldo-"));
      }
      return result;
    }
    return filteredProducts;
  }, [filteredProducts, selectedCategory, pulsaSubFilter]);

  // Distinct Banner Configuration per Category
  const bannerContent = useMemo(() => {
    switch (selectedCategory) {
      case "game-topup":
        return {
          bgClass: "bg-[#dceeff] catalog-banner-gametopup",
          badgeBg: "bg-white dark:bg-[#202436]",
          badgeText: "🎮 RESMI PUBLISHER • AUTO INJEKSI 24/7",
          title: (
            <>
              Top Up Game &<br />
              <span className="text-[#005ea5] dark:text-[#38bdf8]">Currency Instan.</span>
            </>
          ),
          desc: "Isi Diamond Mobile Legends & Free Fire, UC PUBG Mobile, Tokens Honor of Kings, CP CODM hingga PB Cash. Cukup masukkan User ID & Server tanpa login akun, item langsung masuk.",
          stickers: [
            { text: "SERVER ID & ZONE ID TERSEDIA", bg: "bg-[#ffd731] text-black", rotate: "rotate-3" },
            { text: "100% LEGAL & ANTI-MINUS", bg: "bg-[#55db9c] text-black", rotate: "-rotate-6" },
          ],
          quickChips: [
            "Mobile Legends",
            "Free Fire",
            "PUBG Mobile",
            "Honor of Kings",
            "Delta Force",
            "Arena Breakout",
            "Point Blank",
          ],
          perks: ["🎯 Injeksi Langsung ke Akun", "⚡ Settlement < 5 Detik", "🛡️ Garansi Anti-Minus"],
        };
      case "akun-premium":
        return {
          bgClass: "bg-[#e9ccff] catalog-banner-akunpremium",
          badgeBg: "bg-white dark:bg-[#282038]",
          badgeText: "📺 STREAMING & APPS • FULL GARANSI REPLACE",
          title: (
            <>
              Akun & Langganan<br />
              <span className="text-[#5c4ade] dark:text-[#c084fc]">Premium Bergaransi.</span>
            </>
          ),
          desc: "Nikmati hiburan dan produktivitas tanpa jeda iklan: Spotify Premium, Netflix 4K UHD, YouTube Premium, ChatGPT Plus, Canva Pro, CapCut hingga VPN. Bergaransi anti on-hold.",
          stickers: [
            { text: "100% GARANSI REPLACE", bg: "bg-[#ffd731] text-black", rotate: "rotate-3" },
            { text: "SHARING & PRIVATE 1P1U", bg: "bg-[#55db9c] text-black", rotate: "-rotate-6" },
          ],
          quickChips: [
            "Netflix",
            "CapCut",
            "Viu",
          ],
          perks: ["🔒 Garansi 30 - 365 Hari", "⚡ Akses Kilat via Email", "🌟 Durasi Penuh Tanpa Jeda"],
        };
      case "voucher-digital":
        return {
          bgClass: "bg-[#ffd731] catalog-banner-voucher",
          badgeBg: "bg-white dark:bg-[#2b271d]",
          badgeText: "🎟️ VOUCHER DIGITAL & KODE RESMI",
          title: (
            <>
              Voucher Digital &<br />
              <span className="text-[#fb4903] dark:text-[#ffd731]">Kode Resmi Publisher.</span>
            </>
          ),
          desc: "Beli saldo dan voucher digital resmi: Steam Wallet IDR untuk game PC, Google Play Code IDR untuk Android, dan Vidio Voucher Platinum/Ultimate. Kode langsung terbit di layar invoice.",
          stickers: [
            { text: "KODE RESMI PUBLISHER", bg: "bg-white dark:bg-[#2b271d] text-carbon dark:text-white", rotate: "rotate-3" },
            { text: "TERBIT DI INVOICE", bg: "bg-[#55db9c] text-black", rotate: "-rotate-6" },
          ],
          quickChips: ["Steam", "Google Play", "Vidio"],
          perks: ["⚡ Kode Terbit Seketika", "🛡️ Valid & Legal 100%", "💳 Bayar QRIS Bebas Admin"],
        };
      case "pulsa-ewallet":
        return {
          bgClass: "bg-[#ffd731] catalog-banner-pulsa",
          badgeBg: "bg-white dark:bg-[#2b251d]",
          badgeText: "⚡ PPOB RESMI H2H • 24 JAM NONSTOP",
          title: (
            <>
              Pulsa & E-Wallet<br />
              <span className="text-[#fb4903] dark:text-[#ffd731]">Instan Otomatis.</span>
            </>
          ),
          desc: "Isi ulang pulsa reguler semua operator seluler dan top up saldo dompet digital (DANA, GoPay, OVO, ShopeePay, LinkAja, AstraPay, i.saku) dengan harga agen tangan pertama dan masuk dalam hitungan detik.",
          stickers: [
            { text: "PPOB RESMI 24 JAM", bg: "bg-white dark:bg-[#2b251d] text-carbon dark:text-white", rotate: "rotate-3" },
            { text: "INJEKSI 24 JAM NONSTOP", bg: "bg-[#fb4903] text-white", rotate: "-rotate-6" },
          ],
          quickChips: [
            "Telkomsel",
            "Indosat",
            "XL",
            "DANA",
            "GoPay",
            "OVO",
            "ShopeePay",
            "LinkAja",
          ],
          perks: ["📱 Semua Operator Seluler", "💳 8 Dompet Digital Populer", "⚡ Masuk Otomatis Detik Itu Juga"],
        };
      default: // "all"
        return {
          bgClass: "bg-white catalog-banner-default",
          badgeBg: "bg-[#e9ccff] dark:bg-[#282038]",
          badgeText: "✦ DIREKTORI RESMI SELURUH LAYANAN",
          title: (
            <>
              Katalog Produk &<br />
              <span className="text-[#fb4903]">Layanan Resmi.</span>
            </>
          ),
          desc: "Jelajahi 49+ layanan game terverifikasi, akun langganan premium resmi, voucher digital, dan pulsa/e-wallet otomatis. Diproses instan via API settlement 24 jam nonstop tanpa antri.",
          stickers: [
            { text: "TANPA PERLU LOGIN", bg: "bg-[#ffd731] text-black", rotate: "rotate-3" },
            { text: "100% PROSES OTOMATIS", bg: "bg-[#55db9c] text-black", rotate: "-rotate-6" },
          ],
          quickChips: [],
          perks: ["⚡ Injeksi < 5 Detik", "🛡️ Garansi Aman 100%", "💳 QRIS 0% Biaya Admin"],
        };
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-8">
      {/* ========================================================
          1. DYNAMIC CATEGORY HERO BANNER
          Unique color scheme, badge, stickers, and interactive chips
          ======================================================== */}
      <section
        className={`relative ${bannerContent.bgClass} ink-border rounded-3xl p-6 md:p-10 overflow-hidden shadow-[4px_4px_0px_0px_#000000] transition-colors duration-300`}
      >
        {/* Decorative Physical Stickers */}
        {bannerContent.stickers.map((stk, idx) => (
          <div
            key={idx}
            className={`absolute ${
              idx === 0
                ? "-top-3 -right-3 hidden sm:flex items-center gap-1"
                : "top-20 -right-6 hidden lg:block"
            } ${stk.bg} ink-border rounded-full px-4 py-1.5 ${stk.rotate} text-xs font-black shadow-[2px_2px_0px_0px_#000000]`}
          >
            {idx === 0 && <Zap className="w-4 h-4 shrink-0" />}
            <span>{stk.text}</span>
          </div>
        ))}

        <div className="max-w-3xl space-y-3 z-10 relative">
          <h1 className="font-[var(--font-bricolage)] text-3xl sm:text-5xl md:text-5xl font-extrabold uppercase leading-[0.92] tracking-tight text-black dark:text-white">
            {bannerContent.title}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-black/85 dark:text-gray-200 leading-relaxed max-w-xl">
            {bannerContent.desc}
          </p>

          {/* Interactive Perks / Guarantee Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-black">
            {bannerContent.perks.map((p, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-white text-black dark:bg-[#252536] dark:text-white rounded-lg ink-border shadow-[1px_1px_0px_0px_#000000]"
              >
                {p}
              </span>
            ))}
          </div>

          {/* Interactive Quick Filter Chips for Specific Category */}
          {bannerContent.quickChips.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-black/80 dark:text-gray-400 mr-1">Filter Cepat:</span>
              {bannerContent.quickChips.map((chip) => {
                const isActive = searchQuery.toLowerCase() === chip.toLowerCase();
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleQuickChip(chip)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black ink-border transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[1.5px_1.5px_0px_0px_#ffd731] scale-105"
                        : "bg-white text-black hover:bg-gray-100 dark:bg-[#222232] dark:text-gray-200 dark:hover:bg-[#2c2c3e] hover:scale-102 shadow-[1px_1px_0px_0px_#000000]"
                    }`}
                  >
                    <span>{chip}</span>
                    {isActive && <X className="w-3 h-3 text-red-400 dark:text-red-500" />}
                  </button>
                );
              })}
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Special Interactive Phone Prefix Detector for Pulsa & E-Wallet */}
          {selectedCategory === "pulsa-ewallet" && (
            <div className="pt-3 max-w-lg">
              <div className="p-3 bg-white dark:bg-[#1a1a26] ink-border rounded-2xl shadow-[2px_2px_0px_0px_#000000] space-y-2">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#fb4903] dark:text-[#ffd731]" />
                  <span className="text-xs font-black uppercase text-carbon dark:text-white">
                    Cek Operator Otomatis (Ketik Nomor HP)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Contoh: 0812..., 0857..."
                    className="flex-1 px-3 py-1.5 bg-[#f3f4f6] dark:bg-[#262638] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#2b2b40]"
                  />
                  {detectedOperator && (
                    <button
                      type="button"
                      onClick={() => handleQuickChip(detectedOperator.name)}
                      className="px-3 py-1.5 bg-[#55db9c] text-black rounded-xl ink-border text-xs font-black uppercase flex items-center gap-1.5 animate-in fade-in hover:scale-105 transition-all shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>{detectedOperator.name}</span>
                      <ArrowRight className="w-3 h-3 text-black" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 font-semibold">
                  Ketik awalan nomor telepon untuk mendeteksi provider (Telkomsel, Indosat, XL, Tri, Smartfren, by.U).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Pills (Button-based, Clean URL without # hash) */}
        <div className="mt-6 pt-5 border-t border-carbon dark:border-[#38384a] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ink-border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                  : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#222232] dark:text-white dark:hover:bg-[#2c2c40] shadow-[1px_1px_0px_0px_#000000]"
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              type="button"
              onClick={() => handleCategorySelect("game-topup")}
              className={`px-4 py-2 rounded-full text-xs font-bold ink-border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "game-topup"
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                  : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#222232] dark:text-white dark:hover:bg-[#2c2c40] shadow-[1px_1px_0px_0px_#000000]"
              }`}
            >
              Game Top-Up ({gameProducts.length})
            </button>
            <button
              type="button"
              onClick={() => handleCategorySelect("akun-premium")}
              className={`px-4 py-2 rounded-full text-xs font-bold ink-border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "akun-premium"
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                  : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#222232] dark:text-white dark:hover:bg-[#2c2c40] shadow-[1px_1px_0px_0px_#000000]"
              }`}
            >
              Akun Premium ({subscriptionProducts.length})
            </button>
            <button
              type="button"
              onClick={() => handleCategorySelect("voucher-digital")}
              className={`px-4 py-2 rounded-full text-xs font-bold ink-border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "voucher-digital"
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                  : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#222232] dark:text-white dark:hover:bg-[#2c2c40] shadow-[1px_1px_0px_0px_#000000]"
              }`}
            >
              Voucher Digital ({voucherProducts.length})
            </button>
            <button
              type="button"
              onClick={() => handleCategorySelect("pulsa-ewallet")}
              className={`px-4 py-2 rounded-full text-xs font-bold ink-border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "pulsa-ewallet"
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                  : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#222232] dark:text-white dark:hover:bg-[#2c2c40] shadow-[1px_1px_0px_0px_#000000]"
              }`}
            >
              Pulsa & E-Wallet ({pulsaProducts.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari dalam katalog..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#20202e] rounded-full ink-border text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5c4ade] shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          2. DYNAMIC GRID OR CATEGORIZED SECTIONS
          ======================================================== */}
      {selectedCategory === "all" && !searchQuery.trim() ? (
        /* Categorized sections when "Semua" is active and no search query */
        <div className="space-y-12">
          {/* Section 1: Game Top-Up */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-carbon dark:border-[#38384a] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-[#fb4903] ink-border" />
                  <span className="text-xs font-black uppercase text-carbon dark:text-gray-300 tracking-wider">
                    Injeksi Otomatis API
                  </span>
                </div>
                <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black text-carbon dark:text-white uppercase">
                  Katalog Game Top-Up
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                  Top up instan menggunakan User ID & Zone ID. Checkout langsung via QRIS tanpa login.
                </p>
              </div>
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase shrink-0">
                {gameProducts.length} Produk
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
              {gameProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} priority={idx < 6} />
              ))}
            </div>
          </section>

          {/* Section 2: Akun Premium */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-carbon dark:border-[#38384a] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-[#5c4ade] ink-border" />
                  <span className="text-xs font-black uppercase text-carbon dark:text-gray-300 tracking-wider">
                    Lisensi Resmi & Bergaransi
                  </span>
                </div>
                <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black text-carbon dark:text-white uppercase">
                  Akun & Langganan Premium
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                  Aktivasi instan dan garansi full replacement selama masa aktif akun.
                </p>
              </div>
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase shrink-0">
                {subscriptionProducts.length} Produk
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
              {subscriptionProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          {/* Section 3: Voucher Digital */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-carbon dark:border-[#38384a] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-[#55db9c] ink-border" />
                  <span className="text-xs font-black uppercase text-carbon dark:text-gray-300 tracking-wider">
                    Kode Voucher Digital Resmi
                  </span>
                </div>
                <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black text-carbon dark:text-white uppercase">
                  Voucher & Kode Hadiah
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                  Kode redeem instan langsung muncul di layar invoice dan dikirim ke email pembeli.
                </p>
              </div>
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase shrink-0">
                {voucherProducts.length} Produk
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
              {voucherProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          {/* Section 4: Pulsa & E-Wallet */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-carbon dark:border-[#38384a] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-[#fb4903] ink-border" />
                  <span className="text-xs font-black uppercase text-carbon dark:text-gray-300 tracking-wider">
                    PPOB & Dompet Digital 24 Jam
                  </span>
                </div>
                <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black text-carbon dark:text-white uppercase">
                  Pulsa & E-Wallet Instan
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                  Isi ulang pulsa seluler dan saldo e-wallet instan dengan nomor handphone tujuan.
                </p>
              </div>
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase shrink-0">
                {pulsaProducts.length} Produk
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
              {pulsaProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Filtered Grid when a category or search is active */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-carbon dark:border-[#38384a] pb-3">
            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black text-carbon dark:text-white uppercase">
              {selectedCategory === "all"
                ? `Hasil Pencarian: "${searchQuery}"`
                : categories.find((c) => c.slug === selectedCategory)?.name || "Kategori Terpilih"}
            </h2>
            <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">
              {displayProducts.length} Produk Ditemukan
            </span>
          </div>

          {/* Sub-Category Filter for Pulsa & E-Wallet */}
          {selectedCategory === "pulsa-ewallet" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setPulsaSubFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  pulsaSubFilter === "all"
                    ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_0px_#000000] -translate-x-[0.5px] -translate-y-[0.5px]"
                    : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#1f1f2e] dark:text-white dark:hover:bg-[#2b2b3d] shadow-[1px_1px_0px_0px_#000000]"
                }`}
              >
                <span>⚡ Semua Layanan</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    pulsaSubFilter === "all" ? "bg-black text-white" : "bg-gray-200 dark:bg-[#2c2c3e] text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {filteredProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPulsaSubFilter("pulsa")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  pulsaSubFilter === "pulsa"
                    ? "bg-[#fb4903] text-white shadow-[2px_2px_0px_0px_#000000] -translate-x-[0.5px] -translate-y-[0.5px]"
                    : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#1f1f2e] dark:text-white dark:hover:bg-[#2b2b3d] shadow-[1px_1px_0px_0px_#000000]"
                }`}
              >
                <span>📱 Pulsa Reguler</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    pulsaSubFilter === "pulsa" ? "bg-white text-[#fb4903]" : "bg-gray-200 dark:bg-[#2c2c3e] text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {filteredProducts.filter((p) => p.slug.startsWith("pulsa-")).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPulsaSubFilter("ewallet")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  pulsaSubFilter === "ewallet"
                    ? "bg-[#00a8e8] text-white shadow-[2px_2px_0px_0px_#000000] -translate-x-[0.5px] -translate-y-[0.5px]"
                    : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#1f1f2e] dark:text-white dark:hover:bg-[#2b2b3d] shadow-[1px_1px_0px_0px_#000000]"
                }`}
              >
                <span>💳 Dompet Digital / E-Wallet</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    pulsaSubFilter === "ewallet" ? "bg-white text-[#00a8e8]" : "bg-gray-200 dark:bg-[#2c2c3e] text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {filteredProducts.filter((p) => p.slug.startsWith("saldo-")).length}
                </span>
              </button>
            </div>
          )}

          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 lg:gap-4">
              {displayProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 bg-white dark:bg-[#161622] ink-border dark:border-[#38384a] rounded-3xl p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="w-24 h-24 mx-auto relative animate-bounce" style={{ animationDuration: "2.5s" }}>
                <img
                  src="/brand/stiker/xyzi-stiker-cari.png"
                  alt="XYZI Mencari Produk"
                  className="w-full h-full object-contain drop-shadow-[2px_2px_0px_#000]"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-carbon dark:text-white font-[var(--font-bricolage)] uppercase">
                  Yah, Produk Belum Ketemu
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold max-w-sm mx-auto">
                  Tidak ada produk yang cocok dengan kata kunci atau filter kategori Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setInputPhone("");
                  router.replace("/katalog", { scroll: false });
                }}
                className="px-6 py-2.5 bg-[#ffd731] hover:bg-[#ffe066] text-carbon ink-border rounded-full text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
