"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchOrders, requestOrderLookup } from "@/app/actions/order";
import {
  Search,
  RotateCw,
  ExternalLink,
  Truck,
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
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

function getStatusBadge(status: string) {
  switch (status) {
    case "SUCCESS":
      return { label: "✓ SELESAI & TERKIRIM", bg: "bg-[#55db9c] text-black" };
    case "PROCESSING":
      return { label: "⚡ SEDANG DIPROSES", bg: "bg-[#5c4ade] text-white" };
    case "PAID":
      return { label: "✓ DIBAYAR - ANTRI PROSES", bg: "bg-[#ffd731] text-black" };
    case "PENDING":
      return { label: "⏳ MENUNGGU BAYAR", bg: "bg-[#ffd731] text-black" };
    case "EXPIRED":
      return { label: "✕ KEDALUWARSA", bg: "bg-red-500 text-white" };
    case "FAILED":
      return { label: "✕ GAGAL", bg: "bg-red-500 text-white" };
    case "REFUNDED":
      return { label: "↩ DANA DI-REFUND", bg: "bg-purple-600 text-white" };
    default:
      return { label: status, bg: "bg-gray-200 text-black" };
  }
}

function CekTransaksiContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrderResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [emailLookupSent, setEmailLookupSent] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  const executeSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setEmailLookupSent(null);
    setEmailMessage(null);

    try {
      if (trimmed.includes("@")) {
        // Email lookup via magic link to protect customer data
        const res = await requestOrderLookup(trimmed);
        setEmailLookupSent(trimmed);
        setEmailMessage(
          res.message ||
            "Jika email Anda terdaftar dalam pesanan, tautan akses aman telah dikirimkan ke kotak masuk Anda."
        );
        setResults(null);
      } else {
        const data = await searchOrders(trimmed);
        setResults(data as unknown as OrderResult[]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("invoice");
    if (q) {
      setQuery(q);
      executeSearch(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative w-full rounded-3xl ink-border overflow-hidden bg-[#dceeff] dark:bg-[#151926] dark:border-[#38384a] p-6 md:p-10 shadow-[4px_4px_0px_0px_#000000]">
        <div className="absolute right-8 bottom-4 transform rotate-2 hidden lg:flex items-center gap-3 pointer-events-none">
          <div className="w-24 h-24 object-contain drop-shadow-[3px_3px_0px_#000]">
            <img
              src="/brand/stiker/xyzi-stiker-keren.png"
              alt="XYZI Keren"
              className="w-full h-full object-contain"
            />
          </div>
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
            Ketikkan nomor invoice transaksi Anda (contoh:{" "}
            <code className="bg-white dark:bg-[#20202e] dark:border-[#38384a] px-2 py-0.5 rounded ink-border">
              INV-XYZ-...
            </code>
            ) atau alamat email yang digunakan saat pembelian.
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

      {/* Email Magic Link Sent Notification */}
      {emailLookupSent && (
        <div className="bg-[#55db9c]/20 border-2 border-carbon dark:border-[#55db9c] rounded-3xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#000000] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#55db9c] ink-border flex items-center justify-center">
              <Mail className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-[var(--font-bricolage)] text-lg font-black text-carbon dark:text-white uppercase">
                Tautan Akses Riwayat Dikirimkan!
              </h3>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Email tujuan: <span className="font-black text-black dark:text-[#55db9c]">{emailLookupSent}</span>
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed bg-white/70 dark:bg-[#1a1a28]/70 p-4 rounded-xl ink-border">
            {emailMessage} Demi privasi keamanan akun Anda, seluruh riwayat pembelian hanya dapat diakses melalui tautan khusus yang dikirimkan ke email Anda. Silakan cek folder <strong>Kotak Masuk (Inbox)</strong> atau <strong>Spam</strong> Anda.
          </p>
        </div>
      )}

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
                const isPaidOrProcessing = order.status === "PAID" || order.status === "PROCESSING";
                const isFailedOrExpired = order.status === "FAILED" || order.status === "EXPIRED";
                const badge = getStatusBadge(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#000000] space-y-6"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-carbon dark:border-gray-700">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-[var(--font-bricolage)] text-lg font-black text-carbon dark:text-white">
                            {order.invoiceNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ink-border ${badge.bg}`}>
                            {badge.label}
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
                        <span>{isSuccess ? "Buka Kredensial & Ulasan" : "Lihat Invoice & QRIS"}</span>
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
                          isSuccess || isPaidOrProcessing
                            ? "bg-[#f9f9f9] dark:bg-[#1f1f2e] dark:border-[#38384a]"
                            : isFailedOrExpired
                            ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                            : "bg-[#ffd731] text-black"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ink-border flex items-center justify-center font-black text-xs ${
                            isSuccess || isPaidOrProcessing
                              ? "bg-[#55db9c] text-black"
                              : isFailedOrExpired
                              ? "bg-red-500 text-white"
                              : "bg-white text-black animate-pulse"
                          }`}
                        >
                          {isSuccess || isPaidOrProcessing ? "✓" : isFailedOrExpired ? "✕" : "⏳"}
                        </div>
                        <div>
                          <span className={`text-[10px] font-black uppercase block ${isSuccess || isPaidOrProcessing ? "text-gray-600 dark:text-gray-400" : isFailedOrExpired ? "text-red-600 dark:text-red-400" : "text-black/80"}`}>
                            Langkah 2
                          </span>
                          <p className={`text-xs font-black ${isSuccess || isPaidOrProcessing ? "text-carbon dark:text-white" : isFailedOrExpired ? "text-red-600 dark:text-red-400" : "text-black"}`}>
                            {isSuccess || isPaidOrProcessing ? "Pembayaran Terverifikasi" : isFailedOrExpired ? "Pembayaran Gagal/Kedaluwarsa" : "Menunggu QRIS"}
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Item Injected */}
                      <div
                        className={`p-4 ink-border rounded-2xl flex items-center gap-3 ${
                          isSuccess
                            ? "bg-[#55db9c]/30 dark:bg-[#55db9c]/15 dark:border-[#38384a]"
                            : isPaidOrProcessing
                            ? "bg-[#5c4ade]/20 text-[#5c4ade] dark:text-[#a594fd]"
                            : "bg-gray-100 dark:bg-[#181824] opacity-60 dark:border-[#38384a]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ink-border flex items-center justify-center font-black text-xs ${
                            isSuccess
                              ? "bg-[#55db9c] text-black"
                              : isPaidOrProcessing
                              ? "bg-[#5c4ade] text-white animate-pulse"
                              : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {isSuccess ? "✓" : isPaidOrProcessing ? "⚡" : "3"}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-600 dark:text-gray-400 block">
                            Langkah 3
                          </span>
                          <p className="text-xs font-black text-carbon dark:text-white">
                            {isSuccess ? "Item Berhasil Diinjeksi" : isPaidOrProcessing ? "Sedang Mengirim Akun/TopUp" : "Proses Pengiriman"}
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
            <div className="text-center py-12 bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 shadow-[4px_4px_0px_0px_#000000] space-y-3">
              <div className="w-20 h-20 mx-auto animate-bounce" style={{ animationDuration: "2.5s" }}>
                <img
                  src="/brand/stiker/xyzi-stiker-cari.png"
                  alt="XYZI Cari Transaksi"
                  className="w-full h-full object-contain drop-shadow-[2px_2px_0px_#000]"
                />
              </div>
              <h4 className="text-base font-black text-carbon dark:text-white uppercase font-[var(--font-bricolage)]">
                Transaksi Tidak Ditemukan
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold max-w-sm mx-auto">
                Pastikan nomor invoice yang dimasukkan tepat (format: <code className="bg-gray-100 dark:bg-[#252536] dark:border-[#38384a] px-1 py-0.5 rounded font-mono font-bold">INV-XYZ-...</code>) atau alamat email yang digunakan saat checkout.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CekTransaksiPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 text-center">
          <RotateCw className="w-6 h-6 animate-spin mx-auto text-carbon dark:text-white" />
          <p className="text-xs font-bold text-gray-500 mt-2">Memuat pelacakan pesanan...</p>
        </div>
      }
    >
      <CekTransaksiContent />
    </Suspense>
  );
}
