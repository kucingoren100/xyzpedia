"use client";

import { useState } from "react";
import Link from "next/link";
import { searchOrders } from "@/app/actions/order";
import {
  Search,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  ExternalLink,
  Truck,
  Check,
} from "lucide-react";

interface OrderResult {
  id: string;
  invoiceNumber: string;
  targetUserId: string;
  targetZoneId: string | null;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  fulfilledAt: Date | null;
  product: {
    name: string;
    thumbnailUrl: string;
  };
  productItem: {
    name: string;
  };
}

export default function CekTransaksiPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrderResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await searchOrders(query);
      setResults(data as unknown as OrderResult[]);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header Banner (Stitch style from guest_order_tracking_dispatch_status_1) */}
      <div className="relative w-full rounded-3xl ink-border overflow-hidden bg-[#dceeff] dark:bg-[#151926] dark:border-[#38384a] p-6 md:p-10 shadow-[4px_4px_0px_0px_#000000]">
        <div className="absolute right-12 bottom-6 transform rotate-3 hidden lg:block pointer-events-none">
          <div className="bg-[#ffd731] ink-border px-4 py-2 rounded-2xl flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55db9c] ink-border animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              Pengiriman Gateway Aktif
            </span>
          </div>
        </div>

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#20202e] dark:border-[#38384a] text-carbon dark:text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
            <Truck className="w-3.5 h-3.5" />
            <span>Pelacakan Status Pesanan Realtime</span>
          </div>

          <h1 className="font-[var(--font-bricolage)] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-carbon dark:text-white">
            Lacak Pesanan Kamu
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
            Ketikkan nomor invoice transaksi Anda (contoh: <code className="bg-white dark:bg-[#20202e] dark:border-[#38384a] px-2 py-0.5 rounded ink-border">INV-XYZ-...</code>) atau alamat email yang digunakan saat pembelian.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Masukkan No Invoice atau Email..."
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a28] dark:border-[#38384a] text-carbon dark:text-white rounded-2xl ink-border text-xs font-bold placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5c4ade] shadow-[2px_2px_0px_0px_#000000]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-[#ffd731] text-black rounded-2xl ink-border text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
            >
              {isSearching ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-black" />
                  <span>Mencari...</span>
                </>
              ) : (
                <span>Lacak Sekarang</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {results !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-500 dark:text-gray-400">
              Hasil Ditemukan: {results.length} Transaksi
            </span>
          </div>

          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map((order) => {
                const isSuccess = order.status === "SUCCESS";
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#000000] space-y-6"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-carbon dark:border-gray-700">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-[var(--font-bricolage)] text-lg font-black text-carbon dark:text-white">
                            {order.invoiceNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ink-border ${
                              isSuccess
                                ? "bg-[#55db9c] text-black"
                                : "bg-[#ffd731] text-black"
                            }`}
                          >
                            {isSuccess ? "✓ SUKSES & TERKIRIM" : "⏳ MENUNGGU BAYAR"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                          {order.product.name} — {order.productItem.name}
                        </p>
                      </div>

                      <Link
                        href={`/transaksi/${order.invoiceNumber}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-full ink-border text-xs font-black uppercase shadow-[2px_2px_0px_0px_#ffd731] hover:scale-[1.02] transition-transform"
                      >
                        <span>Lihat Invoice & QRIS</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Stitch 3-Step Progress Stepper */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Step 1: Order Created */}
                      <div className="p-4 bg-[#f9f9f9] dark:bg-[#1f1f2e] dark:border-[#38384a] ink-border rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#55db9c] ink-border flex items-center justify-center font-black text-xs text-black">
                          ✓
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block">
                            Langkah 1
                          </span>
                          <p className="text-xs font-black text-carbon dark:text-white">Pesanan Dibuat</p>
                        </div>
                      </div>

                      {/* Step 2: Payment Settlement */}
                      <div
                        className={`p-4 ink-border rounded-2xl flex items-center gap-3 ${
                          isSuccess
                            ? "bg-[#f9f9f9] dark:bg-[#1f1f2e] dark:border-[#38384a]"
                            : "bg-[#ffd731] text-black"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ink-border flex items-center justify-center font-black text-xs ${
                            isSuccess
                              ? "bg-[#55db9c] text-black"
                              : "bg-white text-black animate-pulse"
                          }`}
                        >
                          {isSuccess ? "✓" : "⏳"}
                        </div>
                        <div>
                          <span className={`text-[10px] font-black uppercase block ${isSuccess ? "text-gray-600 dark:text-gray-400" : "text-black/80"}`}>
                            Langkah 2
                          </span>
                          <p className={`text-xs font-black ${isSuccess ? "text-carbon dark:text-white" : "text-black"}`}>
                            {isSuccess ? "Pembayaran Terverifikasi" : "Menunggu QRIS"}
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Item Injected */}
                      <div
                        className={`p-4 ink-border rounded-2xl flex items-center gap-3 ${
                          isSuccess
                            ? "bg-[#55db9c]/30 dark:bg-[#55db9c]/15 dark:border-[#38384a]"
                            : "bg-gray-100 dark:bg-[#181824] opacity-60 dark:border-[#38384a]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ink-border flex items-center justify-center font-black text-xs ${
                            isSuccess ? "bg-[#55db9c] text-black" : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {isSuccess ? "✓" : "3"}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 block">
                            Langkah 3
                          </span>
                          <p className="text-xs font-black text-carbon dark:text-white">
                            {isSuccess ? "Item Berhasil Diinjeksi" : "Proses Pengiriman"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="text-xs font-bold text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-4 pt-2">
                      <span>Tujuan Akun: <strong className="text-carbon dark:text-white">{order.targetUserId} {order.targetZoneId ? `(${order.targetZoneId})` : ""}</strong></span>
                      <span>•</span>
                      <span>Total: <strong className="text-carbon dark:text-white">Rp {order.totalAmount.toLocaleString("id-ID")}</strong></span>
                      <span>•</span>
                      <span>Email: <strong className="text-carbon dark:text-white">{order.customerEmail}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 shadow-[3px_3px_0px_0px_#000000] space-y-2">
              <p className="text-3xl">🔍</p>
              <h4 className="text-base font-black text-carbon dark:text-white">
                Transaksi Tidak Ditemukan
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold max-w-sm mx-auto">
                Pastikan nomor invoice yang dimasukkan tepat (format: <code className="bg-gray-100 dark:bg-[#252536] dark:border-[#38384a] px-1 py-0.5 rounded">INV-XYZ-...</code>) atau alamat email yang digunakan saat checkout.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
