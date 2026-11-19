"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Search,
  ExternalLink,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";

interface OrderItem {
  id: string;
  invoiceNumber: string;
  targetUserId: string;
  targetZoneId: string | null;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string | Date;
  product: {
    name: string;
    slug: string;
    thumbnailUrl: string;
  };
  productItem: {
    name: string;
    sku: string;
  };
}

interface AdminOverviewProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    successOrders: number;
    failedOrders: number;
    todayRevenue: number;
    allTimeRevenue: number;
    productsCount: number;
  };
  recentOrders: any[];
}

export default function AdminOverviewClient({ stats, recentOrders }: AdminOverviewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return {
          bg: "bg-[#55db9c] text-black",
          label: "SUKSES",
        };
      case "PAID":
      case "PROCESSING":
        return {
          bg: "bg-[#4da2ff] text-white",
          label: status === "PAID" ? "DIBAYAR" : "DIPROSES",
        };
      case "PENDING":
        return {
          bg: "bg-[#ffd731] text-black",
          label: "MENUNGGU",
        };
      case "FAILED":
      case "EXPIRED":
        return {
          bg: "bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5]",
          label: status === "FAILED" ? "GAGAL" : "KEDALUWARSA",
        };
      default:
        return {
          bg: "bg-gray-200 text-black",
          label: status,
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopbar
        title="Ringkasan Toko"
        subtitle="Analisis penjualan & monitoring pesanan real-time"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
        
        {/* Urgent Action Alert (if orders waiting for processing) */}
        {stats.paidOrders > 0 && (
          <div className="p-4 bg-[#ffd731] ink-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-black text-[#ffd731] ink-border shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-black uppercase text-black font-[var(--font-bricolage)]">
                  Perhatian: Ada {stats.paidOrders} Pesanan Sedang Menunggu Injeksi!
                </p>
                <p className="text-xs font-semibold text-black/80">
                  Pembayaran sudah diterima. Segera cek status pengiriman otomatis ke provider.
                </p>
              </div>
            </div>
            <Link
              href="/admin/transaksi?status=PAID"
              className="px-4 py-2 bg-black text-white hover:bg-[#fb4903] rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0 shadow-[2px_2px_0px_0px_#ffffff]"
            >
              <span>Periksa Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 1. TOP METRIC STATS CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {/* Card 1: Total Omset */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_#000000] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase text-gray-500 dark:text-gray-400">
                Total Omset Sukses
              </span>
              <span className="p-1.5 rounded-lg bg-[#55db9c] ink-border text-black">
                <DollarSign className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black font-[var(--font-bricolage)] text-carbon dark:text-white leading-tight">
                Rp {stats.allTimeRevenue.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                Akumulasi seluruh transaksi sukses
              </p>
            </div>
          </div>

          {/* Card 2: Omset Hari Ini */}
          <div className="bg-[#dceeff] dark:bg-[#152338] ink-border dark:border-[#2d3f5e] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_#000000] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase text-[#003a6b] dark:text-[#bae6fd]">
                Omset Hari Ini
              </span>
              <span className="p-1.5 rounded-lg bg-white dark:bg-[#202e48] ink-border dark:border-[#385175] text-[#005ea5] dark:text-[#38bdf8]">
                <TrendingUp className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black font-[var(--font-bricolage)] text-[#002f57] dark:text-white leading-tight">
                Rp {stats.todayRevenue.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] font-bold text-[#003a6b]/80 dark:text-sky-300 mt-0.5">
                Sejak pukul 00:00 WIB hari ini
              </p>
            </div>
          </div>

          {/* Card 3: Pesanan Sukses */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_#000000] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase text-gray-500 dark:text-gray-400">
                Pesanan Sukses
              </span>
              <span className="p-1.5 rounded-lg bg-[#ffd731] ink-border text-black">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black font-[var(--font-bricolage)] text-carbon dark:text-white leading-tight">
                {stats.successOrders} / {stats.totalOrders}
              </p>
              <p className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-0.5">
                {stats.totalOrders > 0
                  ? `${Math.round((stats.successOrders / stats.totalOrders) * 100)}% Rasio Keberhasilan`
                  : "Belum ada transaksi"}
              </p>
            </div>
          </div>

          {/* Card 4: Menunggu Bayar (Pending) */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_0px_#000000] flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase text-gray-500 dark:text-gray-400">
                Menunggu Bayar
              </span>
              <span className="p-1.5 rounded-lg bg-[#ffd731] ink-border text-black">
                <Clock className="w-4 h-4 stroke-[3]" />
              </span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black font-[var(--font-bricolage)] text-carbon dark:text-white leading-tight">
                {stats.pendingOrders}
              </p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                QRIS aktif menunggu scan
              </p>
            </div>
          </div>
        </section>

        {/* 2. QUICK MANAGEMENT ACTIONS */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                Pintasan Manajemen Cepat
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Akses instan modul operasional toko online
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {stats.productsCount} Produk Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Link
              href="/admin/transaksi"
              className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black ink-border dark:border-[#38384a] rounded-2xl flex items-center justify-between transition-all group shadow-[2px_2px_0px_0px_#000000]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-[#28283c] group-hover:bg-black group-hover:text-white rounded-xl ink-border">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase">Semua Transaksi</h3>
                  <p className="text-[11px] font-semibold opacity-75">Cek status & bukti bayar</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/produk"
              className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] hover:bg-[#55db9c] hover:text-black dark:hover:bg-[#55db9c] dark:hover:text-black ink-border dark:border-[#38384a] rounded-2xl flex items-center justify-between transition-all group shadow-[2px_2px_0px_0px_#000000]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-[#28283c] group-hover:bg-black group-hover:text-white rounded-xl ink-border">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase">Katalog & Stok</h3>
                  <p className="text-[11px] font-semibold opacity-75">Ubah harga & status stok</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/pengaturan"
              className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] hover:bg-[#e9ccff] hover:text-black dark:hover:bg-[#e9ccff] dark:hover:text-black ink-border dark:border-[#38384a] rounded-2xl flex items-center justify-between transition-all group shadow-[2px_2px_0px_0px_#000000]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-[#28283c] group-hover:bg-black group-hover:text-white rounded-xl ink-border">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase">Gateway & Webhook</h3>
                  <p className="text-[11px] font-semibold opacity-75">Konfigurasi API QiosPay</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* 3. RECENT ORDERS TABLE */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                Aktivitas Transaksi Terbaru
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                8 pesanan terakhir yang masuk ke sistem
              </p>
            </div>
            <Link
              href="/admin/transaksi"
              className="px-3.5 py-1.5 bg-[#f3f4f6] dark:bg-[#20202e] hover:bg-black hover:text-white dark:hover:bg-[#ffd731] dark:hover:text-black rounded-xl ink-border dark:border-[#38384a] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-2.5 px-3">Invoice</th>
                  <th className="py-2.5 px-3">Produk & Item</th>
                  <th className="py-2.5 px-3">Target Akun</th>
                  <th className="py-2.5 px-3">Pembeli</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold">
                {recentOrders.length > 0 ? (
                  recentOrders.map((ord) => {
                    const statusBadge = getStatusBadge(ord.status);
                    const formattedDate = new Date(ord.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-gray-50 dark:hover:bg-[#1f1f2e] transition-colors"
                      >
                        <td className="py-3 px-3">
                          <Link
                            href={`/transaksi/${ord.invoiceNumber}`}
                            target="_blank"
                            className="font-black text-carbon dark:text-white hover:text-[#fb4903] flex items-center gap-1"
                          >
                            <span>{ord.invoiceNumber}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Link>
                          <span className="text-[10px] text-gray-400 block">{formattedDate}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-black text-carbon dark:text-white block">
                            {ord.product?.name || "Produk"}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate max-w-[180px]">
                            {ord.productItem?.name || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-black text-carbon dark:text-white block">
                            {ord.targetUserId}
                          </span>
                          {ord.targetZoneId && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                              Server: {ord.targetZoneId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-gray-700 dark:text-gray-300 block truncate max-w-[150px]">
                            {ord.customerEmail}
                          </span>
                          {ord.customerPhone && (
                            <span className="text-[10px] text-gray-400 block">
                              {ord.customerPhone}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-carbon dark:text-white">
                          Rp {ord.totalAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ink-border uppercase tracking-tight ${statusBadge.bg}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Belum ada transaksi di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
