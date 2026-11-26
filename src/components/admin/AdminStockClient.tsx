"use client";

import { useState, useEffect } from "react";
import AdminTopbar from "./AdminTopbar";
import {
  Activity,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Server,
  Zap,
  Layers,
  ChevronDown,
  ChevronUp,
  Wallet,
  Code2,
} from "lucide-react";

interface ItemReport {
  id: string;
  name: string;
  sku: string;
  dbPrice: number;
  supplierPrice: number | null;
  dbStatus: string;
  serverStatus: string;
  isReady: boolean;
  note: string;
}

interface ProductReport {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  totalItems: number;
  readyCount: number;
  unreadyCount: number;
  items: ItemReport[];
}

export default function AdminStockClient() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [testingSku, setTestingSku] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [resellerName, setResellerName] = useState<string>("");
  const [xavieraBalance, setXavieraBalance] = useState<number>(0);
  const [xavieraResellerName, setXavieraResellerName] = useState<string>("");
  const [products, setProducts] = useState<ProductReport[]>([]);
  const [totalDbItems, setTotalDbItems] = useState(0);
  const [totalReady, setTotalReady] = useState(0);
  const [totalUnready, setTotalUnready] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterReady, setFilterReady] = useState<"ALL" | "READY" | "OUT_OF_STOCK">("ALL");
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Live SKU Tester State
  const [testInputSku, setTestInputSku] = useState("ml5");
  const [testInputTarget, setTestInputTarget] = useState("1215320232610");
  const [testResult, setTestResult] = useState<any>(null);
  const [syncNotice, setSyncNotice] = useState<string>("");
  const [syncingDigi, setSyncingDigi] = useState(false);

  const handleSyncDigiflazzProducts = async () => {
    if (
      !confirm(
        "Tarik dan petakan seluruh produk & harga modal terbaru dari Digiflazz ke katalog database sekarang?"
      )
    ) {
      return;
    }

    try {
      setSyncingDigi(true);
      setSyncNotice("");
      const res = await fetch("/api/admin/products/sync-digiflazz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markupPercent: 8 }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(data.message);
        await loadStockData();
      } else {
        alert("Gagal sinkronisasi Digiflazz: " + (data.message || data.error));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSyncingDigi(false);
    }
  };

  const loadStockData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stock", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance ?? 0);
        setResellerName(data.resellerName || "Digiflazz H2H Partner");
        setXavieraBalance(data.xavieraBalance ?? 0);
        setXavieraResellerName(data.xavieraResellerName || "Xaviera Store Partner");
        setProducts(data.products || []);
        setTotalDbItems(data.totalDbItems || 0);
        setTotalReady(data.totalReady || 0);
        setTotalUnready(data.totalUnready || 0);
      }
    } catch (err) {
      console.error("Gagal load stok:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const handleSyncAll = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menyinkronkan status stok ke server Digiflazz & Xaviera sekarang? Varian yang unavailable di server akan otomatis diubah statusnya menjadi 'Belum tersedia' (OUT_OF_STOCK)."
      )
    ) {
      return;
    }

    try {
      setSyncing(true);
      setSyncNotice("");
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all" }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncNotice(data.message);
        await loadStockData();
      } else {
        alert("Gagal sinkronisasi: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestSku = async (skuToTest?: string) => {
    const sku = (skuToTest || testInputSku).trim();
    if (!sku) {
      alert("Masukkan SKU / Variant ID terlebih dahulu");
      return;
    }

    try {
      setTestingSku(true);
      setTestResult(null);
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_sku",
          sku,
          target: testInputTarget.trim() || "1215320232610",
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (skuToTest) {
        setTestInputSku(skuToTest);
      }
    } catch (err: any) {
      alert("Gagal menguji SKU: " + err.message);
    } finally {
      setTestingSku(false);
    }
  };

  const toggleExpand = (prodId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [prodId]: !prev[prodId],
    }));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.items.some(
        (it) =>
          it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.sku.includes(searchQuery)
      );

    if (!matchesSearch) return false;

    if (filterReady === "READY") {
      return p.readyCount > 0;
    }
    if (filterReady === "OUT_OF_STOCK") {
      return p.unreadyCount > 0;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopbar
        title="Cek Stok & Kesiapan Server"
        subtitle="Monitoring ketersediaan produk dan varian ke server supplier Digiflazz H2H secara real-time"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Banner Alert if Sync Notice */}
        {syncNotice && (
          <div className="bg-[#55db9c]/20 border-2 border-[#55db9c] text-carbon dark:text-white p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#55db9c]" />
              <p className="text-xs sm:text-sm font-bold">{syncNotice}</p>
            </div>
            <button
              onClick={() => setSyncNotice("")}
              className="text-xs font-black uppercase text-gray-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Saldo Digiflazz */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000] relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Saldo Digiflazz
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/20 text-blue-500">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-mono">
                Rp {balance.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-1 truncate">
                {resellerName}
              </p>
            </div>
          </div>

          {/* Card 2: Saldo Xaviera */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000] relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Saldo Xaviera
              </span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-mono">
                Rp {xavieraBalance.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-1 truncate">
                {xavieraResellerName}
              </p>
            </div>
          </div>

          {/* Card 2: Total Item DB */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Varian DB
              </span>
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-carbon dark:text-white">
                {totalDbItems} Item
              </div>
              <p className="text-[11px] font-bold text-gray-400 mt-1">
                Dari {products.length} Katalog Game & Produk
              </p>
            </div>
          </div>

          {/* Card 3: Ready di Server */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Server Ready
              </span>
              <div className="p-2 rounded-xl bg-[#55db9c]/20 text-[#55db9c]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-[#55db9c]">
                {totalReady} Varian
              </div>
              <p className="text-[11px] font-bold text-gray-400 mt-1">
                Kesiapan inject otomatis instan
              </p>
            </div>
          </div>

          {/* Card 4: Unready / Out of Stock */}
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Belum Tersedia
              </span>
              <div className="p-2 rounded-xl bg-red-500/20 text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-red-500">
                {totalUnready} Varian
              </div>
              <p className="text-[11px] font-bold text-gray-400 mt-1">
                Ditutup sementara oleh server Moonton/Supplier
              </p>
            </div>
          </div>
        </section>

        {/* Global Sync Action Bar */}
        <section className="bg-gradient-to-r from-[#ffd731]/10 via-[#38bdf8]/10 to-[#55db9c]/10 dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Server className="w-5 h-5 text-[#ffd731]" />
              <h3 className="text-base sm:text-lg font-black text-carbon dark:text-white uppercase tracking-wider">
                Otomatisasi Sinkronisasi Kesiapan Server
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Periksa ketersediaan 900+ item ke server supplier. Item yang ditutup oleh Moonton/Supplier otomatis diubah menjadi <strong>Belum tersedia</strong> agar pembeli tidak terpotong saldo saat nominal gangguan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={loadStockData}
              disabled={loading || syncing || syncingDigi}
              className="p-3 bg-white dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-carbon dark:text-white hover:bg-gray-100 cursor-pointer transition disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleSyncDigiflazzProducts}
              disabled={syncingDigi || syncing || loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#38bdf8] hover:bg-[#0284c7] text-black font-black text-xs uppercase tracking-wider rounded-xl ink-border shadow-[3px_3px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${syncingDigi ? "animate-spin" : ""}`} />
              {syncingDigi ? "Menarik Digiflazz..." : "Tarik & Petakan Digiflazz"}
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncing || syncingDigi || loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#ffd731] hover:bg-[#e6c12c] text-black font-black text-xs uppercase tracking-wider rounded-xl ink-border shadow-[3px_3px_0px_0px_#000000] transition active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              {syncing ? "Menyinkronkan..." : "Sinkronkan Stok Live"}
            </button>
          </div>
        </section>

        {/* Live SKU Tester Box (Direct Server Query) */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#38bdf8]" />
              <h3 className="text-sm sm:text-base font-black text-carbon dark:text-white uppercase tracking-wider">
                Live Server Diagnostic Tester (Test Langsung Ke Server)
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">
              H2H Endpoint API
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ketik SKU (Buyer SKU Code Digiflazz) untuk mengecek respon server secara live. Fitur ini membaca langsung respon kode error asli seperti <code>out_of_stock</code> atau ketersediaan supplier.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Variant ID / SKU
              </label>
              <input
                type="text"
                value={testInputSku}
                onChange={(e) => setTestInputSku(e.target.value)}
                placeholder="Contoh: 916 (MLBB 3 Diamond)"
                className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold font-mono text-carbon dark:text-white focus:outline-none"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                Target Akun Pengujian (User ID + Zone)
              </label>
              <input
                type="text"
                value={testInputTarget}
                onChange={(e) => setTestInputTarget(e.target.value)}
                placeholder="Contoh: 1215320232610"
                className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold font-mono text-carbon dark:text-white focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex items-end">
              <button
                onClick={() => handleTestSku()}
                disabled={testingSku}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-wider rounded-xl ink-border shadow-[2px_2px_0px_0px_#000000] cursor-pointer hover:opacity-90 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {testingSku ? "Menguji..." : "Tes Kesiapan Server"}
              </button>
            </div>
          </div>

          {/* Result JSON Box */}
          {testResult && (
            <div className="mt-4 p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] text-left">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
                <span className="text-[11px] font-bold text-gray-400">
                  Respon Asli Dari Server Digiflazz:
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    testResult.isAvailable
                      ? "bg-green-500/20 text-green-400 border border-green-500/40"
                      : "bg-red-500/20 text-red-400 border border-red-500/40"
                  }`}
                >
                  {testResult.isAvailable ? "SERVER READY" : "SERVER REJECT / HABIS"}
                </span>
              </div>
              <pre className="text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(testResult.rawResponse || testResult, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* Product & Variant Stock Status Table */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#55db9c]" />
              <h3 className="text-sm sm:text-base font-black text-carbon dark:text-white uppercase tracking-wider">
                Status Ketersediaan Item Top Up ({filteredProducts.length} Game)
              </h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterReady("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  filterReady === "ALL"
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 dark:bg-[#20202e] text-gray-500"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterReady("READY")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  filterReady === "READY"
                    ? "bg-[#55db9c] text-black"
                    : "bg-gray-100 dark:bg-[#20202e] text-gray-500"
                }`}
              >
                Ready
              </button>
              <button
                onClick={() => setFilterReady("OUT_OF_STOCK")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  filterReady === "OUT_OF_STOCK"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-[#20202e] text-gray-500"
                }`}
              >
                Belum Tersedia
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari game (misal: Mobile Legends, Free Fire) atau SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white focus:outline-none"
            />
          </div>

          {/* Product Items Accordion */}
          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm font-bold">
              Memuat data ketersediaan server...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm font-bold">
              Tidak ada produk yang cocok dengan pencarian / filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((p) => {
                const isExpanded = expandedProducts[p.id] ?? false;
                return (
                  <div
                    key={p.id}
                    className="border-2 border-carbon/20 dark:border-[#38384a] rounded-2xl overflow-hidden bg-[#fafafa] dark:bg-[#1b1b28]"
                  >
                    {/* Header Game */}
                    <div
                      onClick={() => toggleExpand(p.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-[#222234] transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#ffd731] text-black font-black flex items-center justify-center text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-carbon dark:text-white flex items-center gap-2">
                            {p.name}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {p.categorySlug}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                            Total {p.totalItems} Varian · {p.readyCount} Ready ·{" "}
                            <span className={p.unreadyCount > 0 ? "text-red-500 font-extrabold" : ""}>
                              {p.unreadyCount} Belum Tersedia
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            p.unreadyCount === 0
                              ? "bg-[#55db9c]/20 text-[#55db9c] border border-[#55db9c]/40"
                              : "bg-red-500/20 text-red-500 border border-red-500/40"
                          }`}
                        >
                          {p.unreadyCount === 0 ? "100% READY" : `${p.unreadyCount} OUT OF STOCK`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Varian List Table */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161622] p-3 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase text-[10px] font-black">
                              <th className="py-2 px-3">SKU</th>
                              <th className="py-2 px-3">Nama Varian</th>
                              <th className="py-2 px-3">Harga Jual</th>
                              <th className="py-2 px-3">Status di DB</th>
                              <th className="py-2 px-3">Kesiapan Server</th>
                              <th className="py-2 px-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold">
                            {p.items.map((it) => (
                              <tr key={it.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a29]">
                                <td className="py-2.5 px-3 font-mono text-[11px] text-[#ffd731]">
                                  {it.sku || "-"}
                                </td>
                                <td className="py-2.5 px-3 text-carbon dark:text-white">
                                  {it.name}
                                </td>
                                <td className="py-2.5 px-3 text-carbon dark:text-gray-300 font-mono">
                                  Rp {it.dbPrice.toLocaleString("id-ID")}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                      it.dbStatus === "AVAILABLE"
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-red-500/10 text-red-500"
                                    }`}
                                  >
                                    {it.dbStatus === "AVAILABLE" ? "Tersedia" : "Belum tersedia"}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5">
                                    {it.isReady ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#55db9c]" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    )}
                                    <span
                                      className={`text-[11px] ${
                                        it.isReady ? "text-[#55db9c]" : "text-red-400"
                                      }`}
                                    >
                                      {it.note}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => handleTestSku(it.sku)}
                                    className="px-2 py-1 bg-gray-100 dark:bg-[#20202e] hover:bg-[#ffd731] hover:text-black rounded text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                                  >
                                    Tes SKU
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}