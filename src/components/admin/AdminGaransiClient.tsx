"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  X,
  ExternalLink,
  AlertTriangle,
  Send,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";

export interface WarrantyClaimWithOrder {
  id: string;
  invoiceNumber: string;
  customerPhone: string;
  customerEmail: string | null;
  issueType: string;
  description: string;
  proofImageUrl: string | null;
  status: string;
  adminNotes: string | null;
  resolvedAt: Date | string | null;
  createdAt: Date | string;
  order?: {
    product: { name: string; slug: string; categorySlug?: string };
    productItem: { name: string };
  } | null;
}

const ISSUE_LABELS: Record<string, string> = {
  ITEM_BELUM_MASUK: "💎 Diamond / Item Belum Masuk",
  AKUN_LOGIN_GAGAL: "🔑 Kendala Kredensial / Akses Akun Bermasalah",
  RESET_PROFIL: "🔄 Profil / Masa Aktif Berkurang",
  SALAH_NOMINAL: "💳 Kendala Pembayaran / Saldo Terpotong",
  LAINNYA: "❓ Kendala Lainnya",
};

export default function AdminGaransiClient({
  initialClaims,
}: {
  initialClaims: WarrantyClaimWithOrder[];
}) {
  const [claims, setClaims] = useState<WarrantyClaimWithOrder[]>(initialClaims);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Modal inspection/update state
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaimWithOrder | null>(null);
  const [editStatus, setEditStatus] = useState<string>("PENDING");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchClaims = async (statusFilter = activeTab) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/warranty-claims?status=${statusFilter}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.claims)) {
        setClaims(data.claims);
      }
    } catch (err) {
      console.error("Gagal refresh data klaim:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (claim: WarrantyClaimWithOrder) => {
    setSelectedClaim(claim);
    setEditStatus(claim.status);
    setEditNotes(claim.adminNotes || "");
  };

  const handleUpdateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/warranty-claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedClaim.id,
          status: editStatus,
          adminNotes: editNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === selectedClaim.id
              ? {
                  ...c,
                  status: editStatus,
                  adminNotes: editNotes,
                  resolvedAt:
                    editStatus === "RESOLVED" || editStatus === "REJECTED"
                      ? new Date()
                      : null,
                }
              : c
          )
        );
        setActionMsg(
          `Status klaim tiket #${selectedClaim.id.slice(-6).toUpperCase()} berhasil diubah menjadi ${editStatus}!`
        );
        setSelectedClaim(null);
      } else {
        alert("Gagal memperbarui: " + (data.message || data.error));
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const counts = {
    all: claims.length,
    pending: claims.filter((c) => c.status === "PENDING").length,
    inReview: claims.filter((c) => c.status === "IN_REVIEW").length,
    resolved: claims.filter((c) => c.status === "RESOLVED").length,
    rejected: claims.filter((c) => c.status === "REJECTED").length,
  };

  const filteredClaims = claims.filter((claim) => {
    if (activeTab !== "ALL" && claim.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchInv = claim.invoiceNumber.toLowerCase().includes(q);
      const matchPhone = claim.customerPhone.toLowerCase().includes(q);
      const matchProd = claim.order?.product?.name.toLowerCase().includes(q);
      return matchInv || matchPhone || matchProd;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="px-2.5 py-1 bg-[#22c55e] text-white font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
            <span>SELESAI</span>
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="px-2.5 py-1 bg-[#3b82f6] text-white font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <Clock className="w-3 h-3 animate-spin" />
            <span>DIPERIKSA</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 bg-[#ef4444] text-white font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <XCircle className="w-3 h-3 stroke-[3]" />
            <span>DITOLAK</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-[#ffd731] text-black font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <Clock className="w-3 h-3" />
            <span>MENUNGGU</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopbar
        title="Pusat Klaim Garansi & Tiket Bantuan"
        subtitle="Kelola tiket komplain pelanggan, selidiki kendala pengiriman, dan berikan jaminan pergantian instan 100%"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Action Msg */}
        {actionMsg && (
          <div className="p-3.5 bg-[#22c55e]/20 border border-[#22c55e] text-emerald-900 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>✅ {actionMsg}</span>
            <button
              onClick={() => setActionMsg(null)}
              className="p-1 hover:bg-black/10 rounded-lg text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-white dark:bg-[#161622] rounded-2xl ink-border dark:border-[#38384a] shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Total Tiket</span>
            <div className="text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)] mt-1">
              {counts.all}
            </div>
          </div>
          <div className="p-4 bg-[#ffd731]/15 rounded-2xl ink-border dark:border-[#38384a] shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block">
              Menunggu Antrian
            </span>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200 font-[var(--font-bricolage)] mt-1">
              {counts.pending}
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl ink-border dark:border-[#38384a] shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 block">
              Sedang Diperiksa
            </span>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 font-[var(--font-bricolage)] mt-1">
              {counts.inReview}
            </div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-2xl ink-border dark:border-[#38384a] shadow-[3px_3px_0px_#000]">
            <span className="text-[10px] font-black uppercase text-green-700 dark:text-green-400 block">
              Selesai Digaransi
            </span>
            <div className="text-2xl font-black text-green-900 dark:text-green-200 font-[var(--font-bricolage)] mt-1">
              {counts.resolved}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {[
              { id: "ALL", label: "Semua", count: counts.all },
              { id: "PENDING", label: "Menunggu", count: counts.pending },
              { id: "IN_REVIEW", label: "Diperiksa", count: counts.inReview },
              { id: "RESOLVED", label: "Selesai", count: counts.resolved },
              { id: "REJECTED", label: "Ditolak", count: counts.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  fetchClaims(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl ink-border text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_#000]"
                    : "bg-white dark:bg-[#161622] text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari invoice / no HP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#161622] ink-border dark:border-[#38384a] rounded-xl text-xs font-bold text-carbon dark:text-white outline-none"
              />
            </div>
            <button
              onClick={() => fetchClaims(activeTab)}
              disabled={isLoading}
              className="p-2 bg-white dark:bg-[#161622] hover:bg-gray-100 dark:hover:bg-[#202030] rounded-xl ink-border dark:border-[#38384a] text-carbon dark:text-white cursor-pointer"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Claims Table / Cards */}
        {filteredClaims.length === 0 ? (
          <div className="bg-white dark:bg-[#161622] ink-border dark:border-[#38384a] rounded-2xl p-8 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-xs font-black uppercase text-gray-400">Tidak ada tiket klaim pada kategori ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white dark:bg-[#161622] ink-border dark:border-[#38384a] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-xs text-carbon dark:text-white bg-gray-100 dark:bg-[#252538] px-2.5 py-1 rounded-lg ink-border">
                      #{claim.id.slice(-6).toUpperCase()}
                    </span>
                    <a
                      href={`/struk/${claim.invoiceNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-black text-xs text-[#2563eb] hover:underline flex items-center gap-1"
                    >
                      <span>{claim.invoiceNumber}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] font-bold text-gray-500">
                      {new Date(claim.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(claim.status)}
                    <button
                      onClick={() => handleOpenModal(claim)}
                      className="px-3 py-1 bg-[#ffd731] hover:bg-[#ffe266] text-black text-xs font-black uppercase rounded-lg ink-border shadow-[1px_1px_0px_#000] active:scale-95 transition-all cursor-pointer"
                    >
                      Tindak Lanjuti
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  {/* Left: Product & Customer */}
                  <div className="md:col-span-4 space-y-1.5 font-bold">
                    <div>
                      <span className="text-[10px] uppercase text-gray-400 block">Layanan:</span>
                      <span className="font-black text-carbon dark:text-white">
                        {claim.order?.product?.name || "Produk Game"} — {claim.order?.productItem?.name || ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-gray-400 block">Kontak WhatsApp:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-carbon dark:text-white">{claim.customerPhone}</span>
                        <a
                          href={`https://wa.me/${claim.customerPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 bg-[#25d366] text-white text-[9px] font-black rounded ink-border flex items-center gap-0.5"
                        >
                          <MessageCircle className="w-2.5 h-2.5 fill-white" />
                          <span>Chat WA</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Issue Description */}
                  <div className="md:col-span-5 space-y-1">
                    <span className="text-[10px] uppercase text-gray-400 block font-black">
                      {ISSUE_LABELS[claim.issueType] || claim.issueType}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium bg-gray-50 dark:bg-[#1a1a28] p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 leading-relaxed">
                      &ldquo;{claim.description}&rdquo;
                    </p>
                    {claim.proofImageUrl && (
                      <a
                        href={claim.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        <span>Bukti Screenshot: {claim.proofImageUrl}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {/* Right: Admin Resolution Notes */}
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[10px] uppercase text-gray-400 block font-black">
                      Catatan / Tanggapan Admin:
                    </span>
                    {claim.adminNotes ? (
                      <div className="p-2 bg-[#ffd731]/20 border border-[#eab308] rounded-xl text-xs font-bold text-amber-950 dark:text-amber-200">
                        {claim.adminNotes}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic block">Belum ada catatan solusi.</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Edit / Update Ticket */}
      {selectedClaim && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#161622] rounded-3xl ink-border-thick dark:border-[#38384a] p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000] max-h-[92vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-carbon dark:border-[#38384a]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#2563eb] bg-blue-100 dark:bg-blue-950/50 px-2 py-0.5 rounded ink-border inline-block">
                  UPDATE KLAIM GARANSI
                </span>
                <h3 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white leading-tight mt-1">
                  Tiket #{selectedClaim.id.slice(-6).toUpperCase()}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => !isUpdating && setSelectedClaim(null)}
                disabled={isUpdating}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#252538] hover:bg-[#ffdad6] ink-border dark:border-[#38384a] flex items-center justify-center text-carbon dark:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Ticket Summary Info */}
            <div className="p-3 bg-gray-50 dark:bg-[#1f1f2e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice:</span>
                <span className="font-mono font-black text-carbon dark:text-white">{selectedClaim.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">WhatsApp Pelanggan:</span>
                <span className="font-black text-carbon dark:text-white">{selectedClaim.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kendala:</span>
                <span className="text-[#fb4903] font-black">{ISSUE_LABELS[selectedClaim.issueType] || selectedClaim.issueType}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateClaim} className="space-y-4 text-xs">
              {/* Status Radio Pills */}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-gray-700 dark:text-gray-300 text-[11px] block">
                  Pilih Status Tiket Baru:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "PENDING", label: "Menunggu Antrian", color: "bg-[#ffd731] text-black" },
                    { id: "IN_REVIEW", label: "Sedang Diperiksa", color: "bg-[#3b82f6] text-white" },
                    { id: "RESOLVED", label: "Selesai (Garansi Diberikan)", color: "bg-[#22c55e] text-white" },
                    { id: "REJECTED", label: "Ditolak / Tidak Valid", color: "bg-[#ef4444] text-white" },
                  ].map((st) => (
                    <label
                      key={st.id}
                      className={`p-2.5 rounded-xl ink-border cursor-pointer text-center font-black uppercase text-[10px] tracking-wide transition-all ${
                        editStatus === st.id
                          ? `${st.color} shadow-[2px_2px_0px_#000]`
                          : "bg-white dark:bg-[#1f1f2e] text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="editStatus"
                        value={st.id}
                        checked={editStatus === st.id}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="sr-only"
                      />
                      <span>{st.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label className="font-black uppercase text-gray-700 dark:text-gray-300 text-[11px] block">
                  Catatan Solusi / Tanggapan Admin (Ditampilkan ke Pelanggan):
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Kredensial akun pengganti sudah dikirim via WhatsApp CS. Silakan periksa pesan masuk Anda."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl text-carbon dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#ffd731]"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  disabled={isUpdating}
                  className="py-3 px-4 rounded-xl ink-border bg-gray-100 hover:bg-gray-200 dark:bg-[#252535] text-carbon dark:text-white font-black uppercase tracking-wider cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="py-3 px-4 rounded-xl ink-border bg-[#ffd731] hover:bg-[#ffe266] text-black font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
