"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Filter,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";

interface Order {
  id: string;
  invoiceNumber: string;
  targetUserId: string;
  targetZoneId: string | null;
  customerEmail: string;
  customerPhone: string | null;
  basePrice: number;
  uniqueCode: number;
  fee: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  qrisString: string | null;
  paidAt: string | Date | null;
  fulfilledAt: string | Date | null;
  notes: string | null;
  createdAt: string | Date;
  product: {
    name: string;
    slug: string;
    thumbnailUrl: string;
    categorySlug?: string;
    developer?: string | null;
  };
  productItem: {
    name: string;
    sku: string;
    price: number;
  };
}

interface StatusCounts {
  ALL: number;
  PENDING: number;
  PAID: number;
  PROCESSING: number;
  SUCCESS: number;
  FAILED_OR_EXPIRED: number;
}

interface AdminTransaksiClientProps {
  initialOrders: any[];
  initialCounts: StatusCounts;
}

export default function AdminTransaksiClient({
  initialOrders,
  initialCounts,
}: AdminTransaksiClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [counts, setCounts] = useState<StatusCounts>(initialCounts);
  const [currentStatus, setCurrentStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedChat, setCopiedChat] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Fetch updated orders from API
  const fetchOrders = async (status = currentStatus, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status);
    fetchOrders(status, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(currentStatus, searchQuery);
  };

  // Export CSV Handler (calls server export API with complete columns & profit)
  const handleExportCsv = async () => {
    try {
      const url = `/api/admin/orders/export?status=${encodeURIComponent(currentStatus)}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal mengunduh laporan dari server");

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `laporan-keuangan-xyzpedia-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      // Client-side fallback if server fails
      if (orders.length === 0) {
        alert("Tidak ada data transaksi untuk diekspor.");
        return;
      }

      const headers = [
        "No. Invoice",
        "Waktu Transaksi",
        "Produk",
        "Varian",
        "Target Akun",
        "No. WhatsApp",
        "Email",
        "Status",
        "Metode Bayar",
        "Total Bayar (Rp)",
      ];

      const rows = orders.map((o) => {
        const dateStr = new Date(o.createdAt).toLocaleString("id-ID");
        const target = o.targetZoneId ? `${o.targetUserId} (${o.targetZoneId})` : o.targetUserId;
        return [
          `"${o.invoiceNumber}"`,
          `"${dateStr}"`,
          `"${(o.product?.name || "").replace(/"/g, '""')}"`,
          `"${(o.productItem?.name || "").replace(/"/g, '""')}"`,
          `"${String(target).replace(/"/g, '""')}"`,
          `"${(o.customerPhone || "-").replace(/"/g, '""')}"`,
          `"${(o.customerEmail || "-").replace(/"/g, '""')}"`,
          `"${o.status}"`,
          `"${(o.paymentMethod || "QRIS").replace(/"/g, '""')}"`,
          o.totalAmount,
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", downloadUrl);
      link.setAttribute(
        "download",
        `laporan-transaksi-xyzpedia-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  // Open Manage Modal
  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setAdminNotes(ord.notes || "");
    setActionSuccessMsg("");
    setCopiedInvoice(false);
    setCopiedChat(false);
  };

  // Update Order Status Handler
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    setActionSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: adminNotes }),
      });

      const data = await res.json();

      if (data.success) {
        setActionSuccessMsg(data.message);
        // Update local state
        const updated = {
          ...selectedOrder,
          status: newStatus,
          notes: adminNotes,
          fulfilledAt: newStatus === "SUCCESS" ? new Date() : selectedOrder.fulfilledAt,
          paidAt: newStatus === "PAID" || newStatus === "SUCCESS" ? new Date() : selectedOrder.paidAt,
        };
        setSelectedOrder(updated);

        // Update list in background
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...updated } : o))
        );
        fetchOrders(currentStatus, searchQuery);
      }
    } catch {
      alert("Gagal memperbarui status pesanan.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Trigger Special Order Actions (Retry fulfillment, complete manual, refund)
  const handleOrderAction = async (actionType: "retry" | "complete_manual" | "refund") => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    setActionSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          sn: adminNotes,
          notes: adminNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(data.message);
        fetchOrders(currentStatus, searchQuery);
        if (data.order) {
          setSelectedOrder({ ...selectedOrder, ...data.order });
        }
      } else {
        alert(data.message || "Gagal memproses aksi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Save Notes Only
  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg("Catatan pesanan berhasil disimpan.");
        setSelectedOrder({ ...selectedOrder, notes: adminNotes });
      }
    } catch {
      alert("Gagal menyimpan catatan.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Copy WhatsApp CS format
  const handleCopyChatFormat = () => {
    if (!selectedOrder) return;
    const msg = `Halo kak ${selectedOrder.customerEmail}!\n\nUpdate pesanan Anda di *XYZPEDIA*:\n🧾 Invoice: *${selectedOrder.invoiceNumber}*\n🎮 Layanan: *${selectedOrder.product.name}*\n💎 Item: *${selectedOrder.productItem.name}*\n🎯 Target ID: *${selectedOrder.targetUserId}${selectedOrder.targetZoneId ? ` (${selectedOrder.targetZoneId})` : ""}*\n📊 Status: *${selectedOrder.status}*\n💰 Total: *Rp ${selectedOrder.totalAmount.toLocaleString("id-ID")}*\n\nCek bukti transaksi real-time: ${window.location.origin}/transaksi/${selectedOrder.invoiceNumber}\n\nTerima kasih telah berbelanja di XYZPEDIA! ⚡`;
    navigator.clipboard.writeText(msg);
    setCopiedChat(true);
    setTimeout(() => setCopiedChat(false), 2500);
  };

  const copyInvoiceText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return {
          bg: "bg-[#55db9c] text-black",
          label: "SUKSES",
        };
      case "PAID":
        return {
          bg: "bg-[#4da2ff] text-white",
          label: "DIBAYAR",
        };
      case "PROCESSING":
        return {
          bg: "bg-[#5c4ade] text-white",
          label: "DIPROSES",
        };
      case "PENDING":
        return {
          bg: "bg-[#ffd731] text-black",
          label: "MENUNGGU",
        };
      case "FAILED":
        return {
          bg: "bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5]",
          label: "GAGAL",
        };
      case "EXPIRED":
        return {
          bg: "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
          label: "EXPIRED",
        };
      default:
        return {
          bg: "bg-gray-200 text-black",
          label: status,
        };
    }
  };

  const statusTabs = [
    { key: "ALL", label: "Semua", count: counts.ALL },
    { key: "PENDING", label: "Menunggu", count: counts.PENDING },
    { key: "PAID", label: "Dibayar", count: counts.PAID },
    { key: "PROCESSING", label: "Diproses", count: counts.PROCESSING },
    { key: "SUCCESS", label: "Sukses", count: counts.SUCCESS },
    { key: "FAILED_OR_EXPIRED", label: "Gagal / Expired", count: counts.FAILED_OR_EXPIRED },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopbar
        title="Manajemen Transaksi"
        subtitle="Monitor, verifikasi pembayaran, & kelola status pesanan pembeli"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Controls Bar: Search & Status Filter */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Invoice, Email, User ID..."
                className="w-full pl-10 pr-24 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-black text-white dark:bg-[#ffd731] dark:text-black rounded-lg text-[10px] font-black uppercase tracking-wider ink-border cursor-pointer"
              >
                Cari
              </button>
            </form>

            {/* Actions: Refresh & Export CSV */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2.5 bg-[#55db9c] hover:bg-[#48c78d] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="Unduh laporan transaksi terfilter ke file Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={() => fetchOrders(currentStatus, searchQuery)}
                disabled={loading}
                className="px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] hover:bg-gray-200 dark:hover:bg-[#2b2b3d] rounded-xl ink-border dark:border-[#38384a] text-xs font-black uppercase tracking-wider text-carbon dark:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Segarkan Data</span>
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 custom-scrollbar">
            {statusTabs.map((tab) => {
              const isActive = currentStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusChange(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#000000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-[#fbfbfd] text-carbon hover:bg-gray-100 dark:bg-[#20202e] dark:text-gray-300 dark:hover:bg-[#2a2a3c] dark:border-[#38384a]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                      isActive
                        ? "bg-white text-black dark:bg-black dark:text-white"
                        : "bg-gray-200 dark:bg-[#2e2e42] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Orders Table */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
              Daftar Pesanan ({orders.length})
            </h2>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Menampilkan {orders.length} transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-3">No. Invoice & Tanggal</th>
                  <th className="py-3 px-3">Layanan & Varian</th>
                  <th className="py-3 px-3">Data Akun</th>
                  <th className="py-3 px-3">Kontak Pembeli</th>
                  <th className="py-3 px-3 text-right">Total Bayar</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold">
                {orders.length > 0 ? (
                  orders.map((ord) => {
                    const statusBadge = getStatusBadge(ord.status);
                    const formattedDate = new Date(ord.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-gray-50 dark:hover:bg-[#1f1f2e] transition-colors"
                      >
                        {/* Invoice & Date */}
                        <td className="py-3.5 px-3">
                          <span className="font-black text-carbon dark:text-white block font-mono">
                            {ord.invoiceNumber}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {formattedDate}
                          </span>
                        </td>

                        {/* Product & Variant */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-carbon dark:text-white block">
                              {ord.product?.name || "Produk"}
                            </span>
                            {ord.product?.categorySlug === "akun-premium" && (
                              (ord.product.developer || "").toLowerCase() === "manual" ? (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded ink-border bg-[#4b5563] text-white">
                                  Manual
                                </span>
                              ) : (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded ink-border bg-[#4338ca] text-white">
                                  Instan
                                </span>
                              )
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate max-w-[180px]">
                            {ord.productItem?.name || "-"}
                          </span>
                        </td>

                        {/* Account Data */}
                        <td className="py-3.5 px-3">
                          <div className="font-black text-carbon dark:text-white">
                            <span>ID: {ord.targetUserId}</span>
                            {ord.targetZoneId && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                                Server: ({ord.targetZoneId})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-3">
                          <span className="text-gray-700 dark:text-gray-300 block truncate max-w-[150px]">
                            {ord.customerEmail}
                          </span>
                          {ord.customerPhone && (
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {ord.customerPhone}
                            </span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-black text-carbon dark:text-white block">
                            Rp {ord.totalAmount.toLocaleString("id-ID")}
                          </span>
                          {ord.uniqueCode > 0 && (
                            <span className="text-[9px] text-[#fb4903] font-bold block">
                              +{ord.uniqueCode} kode unik
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black ink-border uppercase tracking-tight shadow-[1px_1px_0px_#000000] ${statusBadge.bg}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => openOrderModal(ord)}
                            className="px-3 py-1.5 bg-[#ffd731] text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg ink-border text-[11px] font-black uppercase tracking-wider transition-colors shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer"
                          >
                            Kelola
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Tidak ada transaksi yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================
          MODAL DETAIL & KELOLA PESANAN (POP-UP)
          ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#181824] ink-border-thick dark:border-[#38384a] rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-[6px_6px_0px_0px_#000000] max-h-[92vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-black text-carbon dark:text-white">
                    {selectedOrder.invoiceNumber}
                  </span>
                  <button
                    onClick={() => copyInvoiceText(selectedOrder.invoiceNumber)}
                    className="p-1 rounded bg-[#f3f4f6] dark:bg-[#252538] hover:bg-gray-200 text-gray-600 dark:text-gray-300"
                    title="Salin No. Invoice"
                  >
                    {copiedInvoice ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })} WIB
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#252538] hover:bg-[#ffdad6] dark:hover:bg-red-900/40 active:scale-95 ink-border flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Alert if action completed */}
            {actionSuccessMsg && (
              <div className="p-3 bg-[#55db9c]/20 dark:bg-[#55db9c]/10 ink-border border-[#55db9c] rounded-xl text-xs font-black text-green-800 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* 1. Transaction Summary Grid */}
            <div className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                  Informasi Transaksi
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black ink-border uppercase ${
                    getStatusBadge(selectedOrder.status).bg
                  }`}
                >
                  Status: {selectedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Layanan:</span>
                  <span className="font-black text-carbon dark:text-white">{selectedOrder.product.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Varian:</span>
                  <span className="font-black text-carbon dark:text-white">{selectedOrder.productItem.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Target User ID:</span>
                  <span className="font-black text-carbon dark:text-white font-mono">{selectedOrder.targetUserId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Server / Zone ID:</span>
                  <span className="font-black text-carbon dark:text-white font-mono">{selectedOrder.targetZoneId || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Email Pembeli:</span>
                  <span className="font-semibold text-carbon dark:text-white truncate block">{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">No. WhatsApp:</span>
                  <span className="font-semibold text-carbon dark:text-white font-mono">{selectedOrder.customerPhone || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Tipe Pemrosesan:</span>
                  {selectedOrder.product.categorySlug === "akun-premium" ? (
                    (selectedOrder.product.developer || "").toLowerCase() === "manual" ? (
                      <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                        🕒 Akun Premium Manual (Kirim WA)
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                        ⚡ Akun Premium Instan
                      </span>
                    )
                  ) : (
                    <span className="font-semibold text-carbon dark:text-white">Otomatis Publisher</span>
                  )}
                </div>
              </div>

              {selectedOrder.product.categorySlug === "akun-premium" &&
                (selectedOrder.product.developer || "").toLowerCase() === "manual" && (
                  <div className="p-3 bg-[#fff3d4] dark:bg-[#201d14] ink-border rounded-xl space-y-2 mt-2">
                    <span className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-300 block">
                      ⚠️ Penyerahan Kredensial Manual oleh Admin:
                    </span>
                    <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                      Pesanan ini berlabel <strong>Manual</strong>. Kredensial tidak ditampilkan di layar invoice pembeli dan diarahkan untuk diserahkan langsung oleh Admin melalui WhatsApp.
                    </p>
                    {selectedOrder.customerPhone && (
                      <a
                        href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Halo kak, ini kredensial akun untuk pesanan ${selectedOrder.product.name} (${selectedOrder.productItem.name}) dengan No. Invoice ${selectedOrder.invoiceNumber}:\n\nEmail: ...\nPassword: ...\n\nTerima kasih sudah belanja di XYZPEDIA!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-black ink-border rounded-lg text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#000000]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Kirim Kredensial ke WA Pembeli ({selectedOrder.customerPhone})</span>
                      </a>
                    )}
                  </div>
                )}

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs font-black">
                <span className="text-gray-500 dark:text-gray-400 uppercase text-[11px]">Total Tagihan QRIS:</span>
                <span className="text-base text-[#fb4903] font-[var(--font-bricolage)]">
                  Rp {selectedOrder.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Special Workflow Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {(selectedOrder.status === "FAILED" || selectedOrder.status === "PAID") && (
                  <button
                    type="button"
                    onClick={() => handleOrderAction("retry")}
                    disabled={updatingStatus}
                    className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg ink-border text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    🔁 Kirim Ulang ke Supplier (Retry)
                  </button>
                )}
                {selectedOrder.status !== "SUCCESS" && (
                  <button
                    type="button"
                    onClick={() => handleOrderAction("complete_manual")}
                    disabled={updatingStatus}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg ink-border text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    📦 Selesai Manual (Gunakan Catatan sbg SN)
                  </button>
                )}
                {selectedOrder.status !== "REFUNDED" && (
                  <button
                    type="button"
                    onClick={() => handleOrderAction("refund")}
                    disabled={updatingStatus}
                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg ink-border text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    💸 Catat Refund (REFUNDED)
                  </button>
                )}
              </div>
            </div>

            {/* 2. Status Actions (Change Status Buttons) */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-carbon dark:text-white block">
                Ubah Status Transaksi:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("SUCCESS")}
                  disabled={updatingStatus || selectedOrder.status === "SUCCESS"}
                  className="py-2.5 px-2 bg-[#55db9c] text-black hover:bg-[#48c78c] disabled:opacity-40 rounded-xl ink-border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
                >
                  ✓ Sukses
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("PAID")}
                  disabled={updatingStatus || selectedOrder.status === "PAID"}
                  className="py-2.5 px-2 bg-[#4da2ff] text-white hover:bg-blue-600 disabled:opacity-40 rounded-xl ink-border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
                >
                  💳 Dibayar
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("PROCESSING")}
                  disabled={updatingStatus || selectedOrder.status === "PROCESSING"}
                  className="py-2.5 px-2 bg-[#ffd731] text-black hover:bg-amber-400 disabled:opacity-40 rounded-xl ink-border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
                >
                  ⚡ Diproses
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("FAILED")}
                  disabled={updatingStatus || selectedOrder.status === "FAILED"}
                  className="py-2.5 px-2 bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5] hover:bg-red-200 disabled:opacity-40 rounded-xl ink-border dark:border-[#5c1d28] text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
                >
                  ✕ Gagal
                </button>
              </div>

              {/* Special Workflow Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {(selectedOrder.status === "FAILED" || selectedOrder.status === "PAID") && (
                  <button
                    type="button"
                    onClick={() => handleOrderAction("retry")}
                    disabled={updatingStatus}
                    className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg ink-border text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    🔁 Kirim Ulang ke Supplier (Retry)
                  </button>
                )}
                {selectedOrder.status !== "SUCCESS" && (
                  <button
                    type="button"
                    onClick={() => handleOrderAction("complete_manual")}
                    disabled={updatingStatus}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg ink-border text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    📦 Selesai Manual (Gunakan Catatan sbg SN)
                  </button>
                )}
                {selectedOrder.status !== "REFUNDED" && (
                  <button
                    type="button"
                    onClick={() => handleOrderAction("refund")}
                    disabled={updatingStatus}
                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg ink-border text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    💸 Catat Refund (REFUNDED)
                  </button>
                )}
              </div>
            </div>

            {/* 3. Admin Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-carbon dark:text-white flex items-center justify-between">
                <span>Catatan Internal Admin (Opsional):</span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={updatingStatus}
                  className="text-[10px] font-black text-[#5c4ade] dark:text-[#a78bfa] hover:underline"
                >
                  Simpan Catatan
                </button>
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Misal: Sudah diinjeksi manual via portal developer jam 14:30..."
                rows={2}
                className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            {/* 4. Action Buttons Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCopyChatFormat}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#2f2f45] rounded-xl ink-border dark:border-[#38384a] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedChat ? <Check className="w-4 h-4 text-green-600" /> : <MessageSquare className="w-4 h-4" />}
                <span>{copiedChat ? "Format Disalin!" : "Salin Chat Pembeli (WA)"}</span>
              </button>

              <Link
                href={`/transaksi/${selectedOrder.invoiceNumber}`}
                target="_blank"
                className="w-full sm:w-auto px-4 py-2.5 bg-black text-white dark:bg-[#ffd731] dark:text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-[2px_2px_0px_0px_#ffd731]"
              >
                <span>Halaman Invoice Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
