"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";

interface OrderItem {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  customerEmail: string;
  customerPhone?: string | null;
  product?: { name: string; thumbnailUrl: string } | null;
  productItem?: { name: string } | null;
}

export default function CekTransaksiAksesClient({
  result,
  token,
}: {
  result: { success: boolean; error?: string; email?: string; orders?: OrderItem[] };
  token: string;
}) {
  if (!result.success || !result.orders) {
    return (
      <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-8 text-center shadow-[4px_4px_0px_#000000] space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
          Tautan Kedaluwarsa
        </h2>
        <p className="text-xs text-gray-500 font-bold leading-relaxed max-w-md mx-auto">
          {result.error || "Tautan akses hanya berlaku 30 menit demi keamanan data transaksi Anda. Silakan minta tautan baru dari halaman Cek Pesanan."}
        </p>
        <Link
          href="/cek-transaksi"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffd731] text-black font-black text-xs rounded-xl ink-border shadow-[2px_2px_0px_#000000]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kirim Ulang Magic Link
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return {
          label: "SUKSES",
          bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
          icon: CheckCircle2,
        };
      case "PAID":
      case "PROCESSING":
        return {
          label: "DIPROSES",
          bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          icon: Clock,
        };
      case "FAILED":
      case "CANCELLED":
        return {
          label: "GAGAL",
          bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
          icon: XCircle,
        };
      default:
        return {
          label: "PENDING",
          bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link
            href="/cek-transaksi"
            className="inline-flex items-center gap-1.5 text-xs font-black text-gray-500 hover:text-carbon dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-[10px] font-black uppercase rounded-full border border-green-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sesi Magic Link Terverifikasi (30 Menit)
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
            Riwayat Pesanan Anda
          </h1>
          <p className="text-xs text-gray-500 font-bold mt-1">
            Menampilkan seluruh transaksi yang terhubung ke email:{" "}
            <span className="font-mono text-carbon dark:text-white font-black">{result.email}</span>
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {result.orders.length === 0 ? (
          <div className="bg-white dark:bg-[#181824] ink-border rounded-2xl p-12 text-center text-gray-400 font-bold text-xs space-y-2">
            <p>Tidak ada riwayat transaksi yang ditemukan untuk akun email ini.</p>
          </div>
        ) : (
          result.orders.map((ord) => {
            const badge = getStatusBadge(ord.status);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={ord.id}
                className="bg-white dark:bg-[#181824] ink-border rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-start gap-3.5">
                  {ord.product?.thumbnailUrl ? (
                    <img
                      src={ord.product.thumbnailUrl}
                      alt={ord.product.name}
                      className="w-12 h-12 rounded-xl object-cover ink-border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 ink-border flex items-center justify-center font-black text-xs shrink-0">
                      XYZ
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-carbon dark:text-white">
                        {ord.invoiceNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                      {ord.product?.name || "Produk"} —{" "}
                      <span className="text-gray-500 font-medium">{ord.productItem?.name || ""}</span>
                    </p>

                    <p className="text-[11px] text-gray-400 font-bold font-mono">
                      {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800 gap-2">
                  <span className="text-sm font-black text-[#fb4903] font-[var(--font-bricolage)]">
                    Rp {ord.totalAmount.toLocaleString("id-ID")}
                  </span>
                  <Link
                    href={`/transaksi/${ord.invoiceNumber}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffd731] text-black text-xs font-black uppercase rounded-lg ink-border shadow-[1.5px_1.5px_0px_#000000] hover:bg-yellow-400"
                  >
                    <span>Detail Pesanan</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
