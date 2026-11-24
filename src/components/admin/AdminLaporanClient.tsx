"use client";

import React, { useState, useTransition } from "react";
import {
  AdminReportData,
  ReportPeriod,
  getAdminReport,
} from "@/app/actions/adminReport";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Percent,
  Users,
  ShoppingCart,
  Download,
  Flame,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Tv,
} from "lucide-react";

interface AdminLaporanClientProps {
  initialData: AdminReportData;
}

export default function AdminLaporanClient({ initialData }: AdminLaporanClientProps) {
  const [data, setData] = useState<AdminReportData>(initialData);
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>(initialData.period);
  const [chartMetric, setChartMetric] = useState<"omzet" | "laba" | "pesanan" | "kunjungan">("omzet");
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; date: string; value: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    setActivePeriod(newPeriod);
    startTransition(async () => {
      try {
        const updated = await getAdminReport(newPeriod);
        setData(updated);
      } catch (err) {
        console.error("Gagal memuat laporan periode:", err);
      }
    });
  };

  const formatRupiah = (val: number) => {
    return `Rp${val.toLocaleString("id-ID")}`;
  };

  // Unduh CSV
  const handleDownloadCsv = () => {
    const headers = [
      "Invoice",
      "Tanggal Pembuatan",
      "Tanggal Bayar",
      "Produk",
      "Varian",
      "Customer Email",
      "Target",
      "Supplier",
      "Modal (Rp)",
      "Omzet (Rp)",
      "Laba Bersih (Rp)",
      "Status",
    ];

    const rows = data.ordersForCsv.map((o) => [
      o.invoiceNumber,
      `"${o.createdAt}"`,
      o.paidAt ? `"${o.paidAt}"` : `""`,
      `"${o.productName.replace(/"/g, '""')}"`,
      `"${o.variantName.replace(/"/g, '""')}"`,
      o.customerEmail,
      `"${o.target}"`,
      o.supplier,
      o.modal,
      o.omzet,
      o.laba,
      o.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan-penjualan-xyzpedia-${activePeriod}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hitung total untuk chart headline
  const chartTotal =
    chartMetric === "omzet"
      ? data.omzet.value
      : chartMetric === "laba"
      ? data.labaBersih.value
      : chartMetric === "pesanan"
      ? data.pesananLunas.value
      : data.kunjungan.value;

  const chartTotalFormatted =
    chartMetric === "omzet" || chartMetric === "laba"
      ? formatRupiah(chartTotal)
      : `${chartTotal.toLocaleString("id-ID")}`;

  const chartTitle =
    chartMetric === "omzet"
      ? "Omzet per hari"
      : chartMetric === "laba"
      ? "Laba bersih per hari"
      : chartMetric === "pesanan"
      ? "Pesanan lunas per hari"
      : "Kunjungan per hari";

  // Data max value untuk scaling batang grafik
  const maxChartValue = Math.max(
    ...data.dailyPoints.map((p) => p[chartMetric]),
    1
  );

  return (
    <div className="space-y-6 pb-12 font-sans text-gray-200">
      {/* 1. Header & Periode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#28283d] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffd731]/15 text-[#ffd731] flex items-center justify-center font-black">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-[var(--font-bricolage)] font-black text-white tracking-tight">
              Laporan penjualan
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Web tokomu saja, waktu WIB. Dibandingkan dengan periode sebelumnya yang sama panjang.
          </p>
        </div>

        {/* Tab Filter Periode */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1a1a26] border border-[#2d2d42] rounded-xl self-start md:self-auto">
          {(["7d", "30d", "90d"] as ReportPeriod[]).map((p) => {
            const label = p === "7d" ? "7 hari" : p === "30d" ? "30 hari" : "90 hari";
            const isActive = activePeriod === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                disabled={isPending}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                  isActive
                    ? "bg-[#28283e] text-white shadow-sm border border-[#3b3b59]"
                    : "text-gray-400 hover:text-white hover:bg-[#202030]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading overlay indicator */}
      {isPending && (
        <div className="w-full h-1 bg-[#28283e] overflow-hidden rounded-full">
          <div className="w-full h-full bg-[#ffd731] animate-pulse" />
        </div>
      )}

      {/* 2. Top Metric Cards (Row 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4.5 space-y-2 hover:border-[#383854] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Omzet</span>
            <div className="w-6 h-6 rounded-md bg-gray-800 text-gray-300 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-[var(--font-bricolage)] tracking-tight">
            {formatRupiah(data.omzet.value)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {data.omzet.growthPercent >= 0 ? (
              <span className="text-[#55db9c] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{data.omzet.growthPercent}%
              </span>
            ) : (
              <span className="text-[#f87171] flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />{data.omzet.growthPercent}%
              </span>
            )}
            <span className="text-gray-500">vs sebelumnya</span>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4.5 space-y-2 hover:border-[#383854] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Laba bersih</span>
            <div className="w-6 h-6 rounded-md bg-[#55db9c]/15 text-[#55db9c] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#55db9c] font-[var(--font-bricolage)] tracking-tight">
            {formatRupiah(data.labaBersih.value)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {data.labaBersih.growthPercent >= 0 ? (
              <span className="text-[#55db9c] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{data.labaBersih.growthPercent}%
              </span>
            ) : (
              <span className="text-[#f87171] flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />{data.labaBersih.growthPercent}%
              </span>
            )}
            <span className="text-gray-500">vs sebelumnya</span>
          </div>
        </div>

        {/* Pesanan Lunas */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4.5 space-y-2 hover:border-[#383854] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Pesanan lunas</span>
            <div className="w-6 h-6 rounded-md bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-[var(--font-bricolage)] tracking-tight">
            {data.pesananLunas.value.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {data.pesananLunas.growthPercent >= 0 ? (
              <span className="text-[#55db9c] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{data.pesananLunas.growthPercent}%
              </span>
            ) : (
              <span className="text-[#f87171] flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />{data.pesananLunas.growthPercent}%
              </span>
            )}
            <span className="text-gray-500">vs sebelumnya</span>
          </div>
        </div>

        {/* Konversi */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4.5 space-y-2 hover:border-[#383854] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Konversi</span>
            <div className="w-6 h-6 rounded-md bg-amber-500/15 text-[#ffd731] flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#ffd731] font-[var(--font-bricolage)] tracking-tight">
            {data.konversi.value}%
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {data.konversi.growthPercent >= 0 ? (
              <span className="text-[#55db9c] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{data.konversi.growthPercent}%
              </span>
            ) : (
              <span className="text-[#f87171] flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />{data.konversi.growthPercent}%
              </span>
            )}
            <span className="text-gray-500">vs sebelumnya</span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Metric Cards (Row 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rata-rata per Pesanan */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4 space-y-1 hover:border-[#383854] transition-all">
          <span className="text-[11px] font-bold text-gray-400">Rata-rata per pesanan</span>
          <div className="text-lg font-black text-white font-[var(--font-bricolage)]">
            {formatRupiah(data.rataRataPesanan.value)}
          </div>
          <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
            {data.rataRataPesanan.growthPercent >= 0 ? (
              <span className="text-[#55db9c]">+{data.rataRataPesanan.growthPercent}%</span>
            ) : (
              <span className="text-[#f87171]">{data.rataRataPesanan.growthPercent}%</span>
            )}
            <span>vs sebelumnya</span>
          </div>
        </div>

        {/* Margin Laba */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4 space-y-1 hover:border-[#383854] transition-all">
          <span className="text-[11px] font-bold text-gray-400">Margin laba</span>
          <div className="text-lg font-black text-white font-[var(--font-bricolage)]">
            {data.marginLaba.value}%
          </div>
          <div className="text-[10px] font-semibold text-gray-500">
            {data.marginLaba.subtext}
          </div>
        </div>

        {/* Kunjungan */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4 space-y-1 hover:border-[#383854] transition-all">
          <span className="text-[11px] font-bold text-gray-400">Kunjungan</span>
          <div className="text-lg font-black text-white font-[var(--font-bricolage)]">
            {data.kunjungan.value.toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
            {data.kunjungan.growthPercent >= 0 ? (
              <span className="text-[#55db9c]">+{data.kunjungan.growthPercent}%</span>
            ) : (
              <span className="text-[#f87171]">{data.kunjungan.growthPercent}%</span>
            )}
            <span>vs sebelumnya</span>
          </div>
        </div>

        {/* Mulai Checkout */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4 space-y-1 hover:border-[#383854] transition-all">
          <span className="text-[11px] font-bold text-gray-400">Mulai checkout</span>
          <div className="text-lg font-black text-white font-[var(--font-bricolage)]">
            {data.mulaiCheckout.value.toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
            {data.mulaiCheckout.growthPercent >= 0 ? (
              <span className="text-[#55db9c]">+{data.mulaiCheckout.growthPercent}%</span>
            ) : (
              <span className="text-[#f87171]">{data.mulaiCheckout.growthPercent}%</span>
            )}
            <span>vs sebelumnya</span>
          </div>
        </div>
      </div>

      {/* 4. BREAKDOWN LABA BERSIH 2 SUPPLIER (DIGIFLAZZ VS XAVIERA) - PERMINTAAN SPESIFIK USER */}
      <div className="bg-[#14141e] border-2 border-[#2b2b3f] rounded-3xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252538] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-[#55db9c] flex items-center justify-center font-black border border-emerald-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-[var(--font-bricolage)] uppercase tracking-wide">
                Rincian Laba Bersih Supplier Terpakai
              </h2>
              <p className="text-xs text-gray-400">
                Transparansi omzet, modal beli H2H, dan laba bersih di luar modal dari tiap supplier resmi.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 bg-[#1e1e2d] text-gray-300 rounded-full border border-[#33334d] self-start sm:self-auto">
            Periode {activePeriod === "7d" ? "7 Hari" : activePeriod === "30d" ? "30 Hari" : "90 Hari"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Supplier 1: DIGIFLAZZ */}
          <div className="bg-[#181825] border-2 border-[#2f2f45] rounded-2xl p-5 space-y-4 relative overflow-hidden group hover:border-[#434360] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white tracking-wide uppercase">
                      DIGIFLAZZ DIRECT
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      H2H SERVER
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">Game Top Up, Pulsa & Voucher Digital</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-300 bg-[#222234] px-2.5 py-1 rounded-lg">
                {data.suppliers.digiflazz.pesananLunas} Order
              </span>
            </div>

            {/* Metrik Digiflazz */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#12121c] p-3 rounded-xl border border-[#232334]">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Omzet Masuk</span>
                <p className="text-sm font-black text-white mt-0.5">
                  {formatRupiah(data.suppliers.digiflazz.omzet)}
                </p>
              </div>
              <div className="bg-[#12121c] p-3 rounded-xl border border-[#232334]">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Modal Digiflazz</span>
                <p className="text-sm font-black text-gray-300 mt-0.5">
                  {formatRupiah(data.suppliers.digiflazz.modal)}
                </p>
              </div>
            </div>

            {/* Laba Bersih Digiflazz Highlight */}
            <div className="bg-gradient-to-r from-emerald-950/40 to-[#181825] border border-emerald-500/40 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Laba Bersih Digiflazz
                </span>
                <div className="text-xl font-black text-[#55db9c] font-[var(--font-bricolage)]">
                  {formatRupiah(data.suppliers.digiflazz.labaBersih)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Margin Laba</span>
                <span className="text-sm font-black text-emerald-300">
                  {data.suppliers.digiflazz.marginPersen}%
                </span>
              </div>
            </div>
          </div>

          {/* Supplier 2: XAVIERA */}
          <div className="bg-[#181825] border-2 border-[#2f2f45] rounded-2xl p-5 space-y-4 relative overflow-hidden group hover:border-[#434360] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white tracking-wide uppercase">
                      XAVIERA STORE
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      INSTANT API
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">Akun Premium & Langganan Digital</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-300 bg-[#222234] px-2.5 py-1 rounded-lg">
                {data.suppliers.xaviera.pesananLunas} Order
              </span>
            </div>

            {/* Metrik Xaviera */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#12121c] p-3 rounded-xl border border-[#232334]">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Omzet Masuk</span>
                <p className="text-sm font-black text-white mt-0.5">
                  {formatRupiah(data.suppliers.xaviera.omzet)}
                </p>
              </div>
              <div className="bg-[#12121c] p-3 rounded-xl border border-[#232334]">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Modal Xaviera</span>
                <p className="text-sm font-black text-gray-300 mt-0.5">
                  {formatRupiah(data.suppliers.xaviera.modal)}
                </p>
              </div>
            </div>

            {/* Laba Bersih Xaviera Highlight */}
            <div className="bg-gradient-to-r from-purple-950/40 to-[#181825] border border-purple-500/40 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Laba Bersih Xaviera
                </span>
                <div className="text-xl font-black text-[#c084fc] font-[var(--font-bricolage)]">
                  {formatRupiah(data.suppliers.xaviera.labaBersih)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Margin Laba</span>
                <span className="text-sm font-black text-purple-300">
                  {data.suppliers.xaviera.marginPersen}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Grafik Interaktif Batang Harian */}
      <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-5 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-300 capitalize">{chartTitle}</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-[#252538] text-gray-300 rounded-md">
                total {chartTotalFormatted}
              </span>
            </div>
            {hoveredPoint ? (
              <p className="text-xs text-[#ffd731] font-bold mt-1">
                {hoveredPoint.label}: {chartMetric === "omzet" || chartMetric === "laba" ? formatRupiah(hoveredPoint.value) : `${hoveredPoint.value} transaksi`}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Arahkan kursor ke batang untuk melihat detail harian.
              </p>
            )}
          </div>

          {/* Switcher Tab Metrik Grafik */}
          <div className="flex items-center gap-1 p-1 bg-[#12121c] border border-[#2b2b3f] rounded-xl self-start sm:self-auto">
            {(
              [
                { id: "omzet", label: "Omzet" },
                { id: "laba", label: "Laba" },
                { id: "pesanan", label: "Pesanan" },
                { id: "kunjungan", label: "Kunjungan" },
              ] as const
            ).map((m) => {
              const isActive = chartMetric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChartMetric(m.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    isActive
                      ? "bg-[#28283d] text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4">
          <div className="h-44 flex items-end gap-1.5 sm:gap-2 px-1 border-b border-[#2d2d42] pb-1">
            {data.dailyPoints.map((point, idx) => {
              const val = point[chartMetric];
              const heightPercent = maxChartValue > 0 ? Math.max((val / maxChartValue) * 100, 4) : 4;
              const isHovered = hoveredPoint?.date === point.date;

              return (
                <div
                  key={point.date}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  onMouseEnter={() => setHoveredPoint({ label: point.label, date: point.date, value: val })}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Tooltip Float */}
                  {isHovered && (
                    <div className="absolute -top-10 z-20 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg border border-[#444] whitespace-nowrap pointer-events-none">
                      {point.label}: {chartMetric === "omzet" || chartMetric === "laba" ? formatRupiah(val) : val}
                    </div>
                  )}

                  {/* Batang */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                      isHovered
                        ? "bg-[#ffd731] shadow-[0_0_12px_rgba(255,215,49,0.5)]"
                        : val > 0
                        ? "bg-[#d1d5db] hover:bg-white"
                        : "bg-[#252538] hover:bg-[#34344d]"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Sumbu X (Tanggal Mulai, Tengah, Akhir) */}
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 pt-2 px-1">
            <span>{data.dailyPoints[0]?.label || "Awal"}</span>
            <span>
              {data.dailyPoints[Math.floor(data.dailyPoints.length / 2)]?.label || "Tengah"}
            </span>
            <span>{data.dailyPoints[data.dailyPoints.length - 1]?.label || "Hari ini"}</span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Widgets: Corong Pembeli, Produk Terlaris, Jam Ramai */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Widget 1: Corong Pembeli (Funnel) */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Y</span>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Corong pembeli
            </h3>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {/* Kunjungan */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  Kunjungan
                </span>
                <span className="font-black text-white">{data.funnel.kunjungan}</span>
              </div>
              <div className="w-full bg-[#252538] h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-full rounded-full" />
              </div>
            </div>

            {/* Mulai Checkout */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                  Mulai checkout
                </span>
                <span className="font-bold text-gray-200">
                  {data.funnel.mulaiCheckout} · <span className="text-gray-400">{data.funnel.mulaiCheckoutPercent}%</span>
                </span>
              </div>
              <div className="w-full bg-[#252538] h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(data.funnel.mulaiCheckoutPercent * 2, 100)}%` }}
                  className="bg-amber-400 h-full rounded-full"
                />
              </div>
            </div>

            {/* Lunas */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Lunas
                </span>
                <span className="font-bold text-[#55db9c]">
                  {data.funnel.lunas} · <span className="text-emerald-300">{data.funnel.lunasPercent}%</span>
                </span>
              </div>
              <div className="w-full bg-[#252538] h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(data.funnel.lunasPercent, 100)}%` }}
                  className="bg-[#55db9c] h-full rounded-full"
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 pt-1">
            Kunjungan dihitung per sesi browser di platform XYZPEDIA.
          </p>
        </div>

        {/* Widget 2: Produk Terlaris */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Produk terlaris
            </h3>
          </div>

          {data.topProducts.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              Belum ada pesanan lunas di periode ini.
            </p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, idx) => {
                const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
                return (
                  <div key={`${p.name}-${p.variant}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span>{medal}</span>
                        <span className="font-bold text-gray-200 truncate">
                          {p.name} · <span className="text-gray-400 font-normal">{p.variant}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-400 font-bold">{p.salesCount}x</span>
                        <span className="font-black text-white">{formatRupiah(p.totalOmzet)}</span>
                      </div>
                    </div>
                    {/* Tiny bar */}
                    <div className="w-full bg-[#252538] h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min((p.totalOmzet / (data.topProducts[0]?.totalOmzet || 1)) * 100, 100)}%`,
                        }}
                        className="bg-amber-400 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Widget 3: Jam Ramai (Heatmap 24 Jam) */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Jam ramai (pesanan lunas)
            </h3>
          </div>

          {/* Grid 24 Jam */}
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-1 pt-1">
            {data.hourlyHeatmap.map((slot) => {
              const intensity = slot.count === 0 ? "bg-[#222233]" : slot.count === 1 ? "bg-[#4b5563]" : slot.count === 2 ? "bg-[#9ca3af]" : "bg-white";
              return (
                <div
                  key={slot.hour}
                  title={`Pukul ${slot.hour}.00 WIB: ${slot.count} pesanan`}
                  className={`h-7 rounded flex items-center justify-center text-[10px] font-bold text-black transition-colors ${intensity}`}
                >
                  <span className={slot.count > 1 ? "text-black" : "text-gray-400"}>
                    {slot.hour}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed pt-2">
            Paling ramai sekitar <span className="text-white font-bold">{data.peakHourLabel}</span>. Pasang promo atau broadcast pesan menjelang jam ramai.
          </p>
        </div>
      </div>

      {/* 7. Footer Cards: Pembeli Berulang, Potongan Kupon, & Unduh CSV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pembeli Berulang */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4.5 space-y-1">
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold">Pembeli berulang</span>
          </div>
          <div className="text-xl font-black text-white font-[var(--font-bricolage)] pt-1">
            {data.pembeliBerulang.repeatCount} / {data.pembeliBerulang.totalCustomers}
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {data.pembeliBerulang.percent}% beli lebih dari sekali di periode ini.
          </p>
        </div>

        {/* Potongan Kupon */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4.5 space-y-1">
          <div className="flex items-center gap-2 text-gray-400">
            <Percent className="w-4 h-4" />
            <span className="text-xs font-bold">Potongan kupon</span>
          </div>
          <div className="text-xl font-black text-white font-[var(--font-bricolage)] pt-1">
            {formatRupiah(data.potonganKupon.totalDiscount)}
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {data.potonganKupon.usedCount} kupon diberikan di periode ini.
          </p>
        </div>

        {/* Unduh CSV Pesanan */}
        <div className="bg-[#171723] border border-[#28283d] rounded-2xl p-4.5 flex flex-col justify-between space-y-2">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="w-full py-2.5 px-4 bg-[#ffd731] hover:bg-[#ffe066] text-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:translate-y-0.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh CSV pesanan ({activePeriod === "7d" ? "7 hari" : activePeriod === "30d" ? "30 hari" : "90 hari"})</span>
          </button>
          <p className="text-[10px] text-gray-500 text-center">
            Laporan pesanan dapat diunduh kapan saja untuk pembukuan.
          </p>
        </div>
      </div>
    </div>
  );
}
