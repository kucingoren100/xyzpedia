"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";

interface PriceItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  stockStatus: string;
}

interface PriceProduct {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  thumbnailUrl: string;
  items: PriceItem[];
}

interface CategoryOption {
  slug: string;
  name: string;
}

interface DaftarHargaClientProps {
  categories: CategoryOption[];
  products: PriceProduct[];
}

export default function DaftarHargaClient({
  categories,
  products,
}: DaftarHargaClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const availableProductsForFilter = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.categorySlug === selectedCategory);
  }, [products, selectedCategory]);

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: Array<{
      product: PriceProduct;
      item: PriceItem;
    }> = [];

    for (const prod of products) {
      if (selectedCategory !== "all" && prod.categorySlug !== selectedCategory) continue;
      if (selectedProductSlug !== "all" && prod.slug !== selectedProductSlug) continue;

      for (const item of prod.items) {
        if (onlyAvailable && item.stockStatus !== "AVAILABLE") continue;
        if (
          q &&
          !prod.name.toLowerCase().includes(q) &&
          !item.name.toLowerCase().includes(q)
        ) {
          continue;
        }
        list.push({ product: prod, item });
      }
    }

    return list;
  }, [products, selectedCategory, selectedProductSlug, searchQuery, onlyAvailable]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-8 shadow-[4px_4px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#ffd731] ink-border flex items-center justify-center p-1 shrink-0 shadow-[2px_2px_0px_0px_#000000]">
            <img
              src="/brand/stiker/xyzi-stiker-cinta.png"
              alt="XYZI Daftar Harga"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-[var(--font-bricolage)] text-2xl sm:text-3xl font-black uppercase text-carbon dark:text-white leading-tight">
              Daftar Harga Resmi
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
              Harga real-time langsung dari katalog XYZPEDIA • QRIS 0% biaya admin.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="inline-block px-3 py-1 bg-[#55db9c] text-black rounded-full ink-border text-[11px] font-black uppercase">
            {rows.length} Varian Ditampilkan
          </span>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_#000000] space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedProductSlug("all");
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase ink-border whitespace-nowrap shrink-0 cursor-pointer transition-all ${
              selectedCategory === "all"
                ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                : "bg-[#f3f4f6] text-carbon hover:bg-gray-200 dark:bg-[#222232] dark:text-white dark:hover:bg-[#2c2c40]"
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSelectedProductSlug("all");
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold ink-border whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                selectedCategory === cat.slug
                  ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731]"
                  : "bg-[#f3f4f6] text-carbon hover:bg-gray-200 dark:bg-[#222232] dark:text-white dark:hover:bg-[#2c2c40]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Dropdown, Search & Stock Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4">
            <select
              value={selectedProductSlug}
              onChange={(e) => setSelectedProductSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white focus:outline-none"
            >
              <option value="all">Semua Produk ({availableProductsForFilter.length})</option>
              {availableProductsForFilter.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name} ({p.items.length})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk atau nominal (mis. 86 Diamond, Netflix)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-center sm:justify-end">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-carbon dark:text-gray-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded accent-[#fb4903] cursor-pointer"
              />
              <span>Hanya yang Ready</span>
            </label>
          </div>
        </div>
      </section>

      {/* Price Table (Desktop) & Cards (Mobile) */}
      {rows.length === 0 ? (
        <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-10 text-center space-y-3 shadow-[3px_3px_0px_0px_#000000]">
          <div className="w-16 h-16 mx-auto">
            <img
              src="/brand/stiker/xyzi-stiker-cari.png"
              alt="Tidak ditemukan"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-sm font-black text-carbon dark:text-white">
            Tidak ada varian yang cocok dengan filter kamu.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f4f6] dark:bg-[#20202e] border-b border-carbon dark:border-[#38384a] text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  <th className="py-3.5 px-5">Produk</th>
                  <th className="py-3.5 px-4">Varian / Nominal</th>
                  <th className="py-3.5 px-4">Harga</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2b2b3d] text-xs">
                {rows.map(({ product, item }) => {
                  const isReady = item.stockStatus === "AVAILABLE";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#fbfbfd] dark:hover:bg-[#1f1f2e] transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={product.thumbnailUrl}
                            alt={product.name}
                            className="w-8 h-8 rounded-lg object-cover ink-border dark:border-[#38384a] shrink-0"
                            loading="lazy"
                          />
                          <span className="font-black text-carbon dark:text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-200">
                        {item.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#fb4903] dark:text-[#ffd731]">
                            Rp {item.price.toLocaleString("id-ID")}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-[11px] text-gray-400 line-through font-semibold">
                              Rp {item.originalPrice.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#55db9c]/25 text-emerald-700 dark:text-[#55db9c] text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Ready</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 text-[10px] font-black uppercase">
                            <XCircle className="w-3 h-3" />
                            <span>Habis</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Link
                          href={`/produk/${product.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-carbon text-white dark:bg-[#ffd731] dark:text-black hover:bg-[#fb4903] hover:text-white rounded-full ink-border text-[10px] font-black uppercase transition-colors"
                        >
                          <span>Beli</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Compact List */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-[#2b2b3d]">
            {rows.map(({ product, item }) => {
              const isReady = item.stockStatus === "AVAILABLE";
              return (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="w-9 h-9 rounded-lg object-cover ink-border dark:border-[#38384a] shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs font-black text-carbon dark:text-white truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-[#fb4903] dark:text-[#ffd731]">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            isReady
                              ? "bg-[#55db9c]/25 text-emerald-700 dark:text-[#55db9c]"
                              : "bg-red-500/15 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isReady ? "Ready" : "Habis"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/produk/${product.slug}`}
                    className="shrink-0 px-3 py-1.5 bg-carbon text-white dark:bg-[#ffd731] dark:text-black rounded-full ink-border text-[10px] font-black uppercase"
                  >
                    Beli
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
