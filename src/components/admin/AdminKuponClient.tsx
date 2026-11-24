"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Percent,
  DollarSign,
  Pencil,
  Trash2,
  Power,
  Layers,
  Search,
  Check,
  X,
  Package,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  thumbnailUrl?: string;
}

interface Coupon {
  id?: string;
  code: string;
  type: string;
  value: number;
  maxDiscount?: number | null;
  minSpend?: number | null;
  active: boolean;
  applicableProducts?: string | null;
  createdAt?: string;
}

export default function AdminKuponClient({ session }: { session: any }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: 10,
    maxDiscount: 5000,
    minSpend: 0,
    active: true,
    scopeType: "ALL" as "ALL" | "SELECTED",
    selectedSlugs: [] as string[],
  });

  const [productSearch, setProductSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCouponsAndProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        if (data.products) {
          setProducts(data.products);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndProducts();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: "",
      type: "percent",
      value: 10,
      maxDiscount: 5000,
      minSpend: 0,
      active: true,
      scopeType: "ALL",
      selectedSlugs: [],
    });
    setProductSearch("");
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);

    let scopeType: "ALL" | "SELECTED" = "ALL";
    let selectedSlugs: string[] = [];

    if (coupon.applicableProducts && coupon.applicableProducts !== "ALL") {
      try {
        const parsed = JSON.parse(coupon.applicableProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          scopeType = "SELECTED";
          selectedSlugs = parsed;
        }
      } catch {
        const split = coupon.applicableProducts.split(",").map((s) => s.trim().toLowerCase());
        if (split.length > 0 && split[0] !== "all") {
          scopeType = "SELECTED";
          selectedSlugs = split;
        }
      }
    }

    setForm({
      code: coupon.code,
      type: coupon.type || "percent",
      value: coupon.value,
      maxDiscount: coupon.maxDiscount ?? 0,
      minSpend: coupon.minSpend ?? 0,
      active: coupon.active,
      scopeType,
      selectedSlugs,
    });
    setProductSearch("");
    setShowModal(true);
  };

  const handleToggleActive = async (code: string, currentActive: boolean) => {
    setActionLoading(`toggle-${code}`);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Status kupon ${code} berhasil diubah menjadi ${!currentActive ? "Aktif" : "Nonaktif"}.`,
        });
        await fetchCouponsAndProducts();
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengubah status kupon." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kupon ${code}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setActionLoading(`delete-${code}`);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Kupon ${code} berhasil dihapus.` });
        await fetchCouponsAndProducts();
      } else {
        setMessage({ type: "error", text: data.message || "Gagal menghapus kupon." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleProductSlug = (slug: string) => {
    const lower = slug.toLowerCase();
    setForm((prev) => {
      const exists = prev.selectedSlugs.includes(lower);
      const next = exists
        ? prev.selectedSlugs.filter((s) => s !== lower)
        : [...prev.selectedSlugs, lower];
      return { ...prev, selectedSlugs: next };
    });
  };

  const handleSelectAllProducts = () => {
    const all = products.map((p) => p.slug.toLowerCase());
    setForm((prev) => ({ ...prev, selectedSlugs: all }));
  };

  const handleClearSelectedProducts = () => {
    setForm((prev) => ({ ...prev, selectedSlugs: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (form.scopeType === "SELECTED" && form.selectedSlugs.length === 0) {
      alert("Harap pilih minimal 1 produk jika membatasi kupon pada produk tertentu.");
      setSubmitting(false);
      return;
    }

    const applicableProducts =
      form.scopeType === "ALL" ? "ALL" : JSON.stringify(form.selectedSlugs);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: form.value,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
          minSpend: form.minSpend ? Number(form.minSpend) : 0,
          active: form.active,
          applicableProducts,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Kupon ${form.code.toUpperCase()} berhasil disimpan!`,
        });
        setShowModal(false);
        await fetchCouponsAndProducts();
      } else {
        setMessage({ type: "error", text: data.message || "Gagal menyimpan kupon." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper untuk parsing produk kupon
  const getCouponApplicableInfo = (coupon: Coupon) => {
    if (!coupon.applicableProducts || coupon.applicableProducts === "ALL") {
      return { isAll: true, count: 0, names: [] };
    }

    let slugs: string[] = [];
    try {
      slugs = JSON.parse(coupon.applicableProducts);
    } catch {
      slugs = coupon.applicableProducts.split(",").map((s) => s.trim().toLowerCase());
    }

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return { isAll: true, count: 0, names: [] };
    }

    const matchedNames = slugs.map((slug) => {
      const prod = products.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
      return prod ? prod.name : slug;
    });

    return { isAll: false, count: slugs.length, names: matchedNames };
  };

  const filteredProductsForModal = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopbar
        title="Kupon Promo & Diskon"
        subtitle="Kelola kode voucher diskon dengan batas harga modal dan batasan produk tertentu"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto pb-16">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#14141e] border-2 border-[#2b2b3f] rounded-3xl p-5 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffd731] text-black rounded-2xl ink-border flex items-center justify-center font-black shadow-[2px_2px_0px_#000000]">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
                Kupon Promo & Diskon
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Kelola kode kupon, atur diskon, aktifkan/nonaktifkan, dan tentukan produk yang berlaku.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={fetchCouponsAndProducts}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1f1f2e] text-xs font-black text-carbon dark:text-white rounded-xl ink-border shadow-[2px_2px_0px_#000000] hover:bg-gray-100 dark:hover:bg-[#28283c] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Segarkan
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffd731] hover:bg-[#ffe066] text-black text-xs font-black rounded-xl ink-border shadow-[2px_2px_0px_#000000] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Tambah Kupon
            </button>
          </div>
        </div>

        {/* Notifikasi Message */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border-2 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000] ${
              message.type === "success"
                ? "bg-green-500/10 border-[#55db9c] text-green-400"
                : "bg-red-500/10 border-[#f87171] text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-[#55db9c]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#f87171]" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-white text-xs font-black ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && coupons.length === 0 && (
          <div className="py-12 text-center text-gray-500 font-bold text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#ffd731]" />
            <span>Memuat data kupon promo...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && coupons.length === 0 && (
          <div className="bg-[#181824] border-2 border-[#2b2b3f] rounded-3xl p-12 text-center space-y-4 shadow-[4px_4px_0px_0px_#000000]">
            <Ticket className="w-12 h-12 text-gray-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-white font-[var(--font-bricolage)]">
                Belum Ada Kupon Promo
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Buat kupon promo pertama untuk memberikan diskon spesial bagi pelanggan XYZPEDIA.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#ffd731] text-black text-xs font-black rounded-xl ink-border shadow-[2px_2px_0px_#000000] inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat Kupon Baru</span>
            </button>
          </div>
        )}

        {/* Grid of Coupons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon) => {
            const applicableInfo = getCouponApplicableInfo(coupon);
            const isDeleting = actionLoading === `delete-${coupon.code}`;
            const isToggling = actionLoading === `toggle-${coupon.code}`;

            return (
              <div
                key={coupon.code}
                className="bg-white dark:bg-[#181824] ink-border dark:border-[#33334d] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000] space-y-4 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 font-mono font-black text-sm rounded-lg border border-yellow-400/50">
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon.code, coupon.active)}
                      disabled={isToggling}
                      title="Klik untuk ubah status aktif/nonaktif"
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border cursor-pointer transition-all ${
                        coupon.active
                          ? "bg-emerald-500/15 text-[#55db9c] border-emerald-500/40 hover:bg-emerald-500/25"
                          : "bg-gray-500/15 text-gray-400 border-gray-600 hover:bg-gray-500/25"
                      }`}
                    >
                      {isToggling ? "Memproses..." : coupon.active ? "● Aktif" : "○ Nonaktif"}
                    </button>
                  </div>

                  {/* Diskon Value */}
                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Besar Potongan:{" "}
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-black text-sm">
                        {coupon.type === "percent" ? `${coupon.value}%` : `Rp ${coupon.value.toLocaleString("id-ID")}`}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-[#252538]">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400">Maks Diskon</span>
                        <span className="font-mono font-bold text-carbon dark:text-gray-200">
                          {coupon.maxDiscount ? `Rp ${coupon.maxDiscount.toLocaleString("id-ID")}` : "Tanpa Batas"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400">Min Belanja</span>
                        <span className="font-mono font-bold text-carbon dark:text-gray-200">
                          {coupon.minSpend ? `Rp ${coupon.minSpend.toLocaleString("id-ID")}` : "Rp 0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cakupan Produk */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#252538] space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Cakupan Produk:
                    </span>
                    {applicableInfo.isAll ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-[#55db9c] border border-emerald-500/30 text-[11px] font-black">
                        <Check className="w-3 h-3" />
                        <span>Semua Produk (Global)</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[11px] font-black">
                          <Package className="w-3 h-3" />
                          <span>Hanya {applicableInfo.count} Produk Pilihan</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate font-medium">
                          {applicableInfo.names.slice(0, 3).join(", ")}
                          {applicableInfo.names.length > 3 && ` +${applicableInfo.names.length - 3} lainnya`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Edit & Hapus */}
                <div className="pt-3 border-t border-gray-200 dark:border-[#2b2b3f] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                    <span>Proteksi Modal</span>
                    <CheckCircle2 className="w-3 h-3 text-[#55db9c]" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(coupon)}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#34344d] rounded-lg ink-border text-[11px] font-black text-carbon dark:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon.code)}
                      disabled={isDeleting}
                      className="p-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-500 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Hapus Kupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Tambah / Edit Kupon */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-6 max-w-lg w-full shadow-[8px_8px_0px_#000000] space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#ffd731] text-black rounded-xl ink-border">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
                    {editingCoupon ? `Edit Kupon: ${editingCoupon.code}` : "Tambah Kupon Promo Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#252538] flex items-center justify-center text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Kode Kupon */}
                <div>
                  <label className="block font-black mb-1 text-gray-700 dark:text-gray-300">
                    Kode Promo (Huruf Kapital) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="CONTOH: PROMOHEMAT"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-mono uppercase font-black text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Gunakan huruf besar tanpa spasi (contoh: HEMAT5, SPOTIFYVIP).
                  </p>
                </div>

                {/* Tipe & Nilai Diskon */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black mb-1 text-gray-700 dark:text-gray-300">
                      Tipe Diskon
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-bold cursor-pointer"
                    >
                      <option value="percent">Persentase (%)</option>
                      <option value="fixed">Nominal Tetap (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-black mb-1 text-gray-700 dark:text-gray-300">
                      Nilai ({form.type === "percent" ? "%" : "Rp"}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={form.type === "percent" ? 100 : 1000000}
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Maks Diskon & Min Belanja */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black mb-1 text-gray-700 dark:text-gray-300">
                      Maks Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={form.maxDiscount || ""}
                      placeholder="0 = Tanpa batas"
                      onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-1 text-gray-700 dark:text-gray-300">
                      Min Belanja (Rp)
                    </label>
                    <input
                      type="number"
                      value={form.minSpend || ""}
                      placeholder="0 = Tanpa syarat"
                      onChange={(e) => setForm({ ...form, minSpend: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* CAKUPAN PRODUK (FITUR SPESIFIK USER) */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <div>
                    <label className="block font-black text-gray-800 dark:text-gray-200">
                      Cakupan Produk yang Berlaku
                    </label>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Tentukan apakah kupon ini bebas dipakai untuk semua produk atau dibatasi hanya untuk produk tertentu.
                    </p>
                  </div>

                  {/* Radio Opsi Cakupan */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, scopeType: "ALL" })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        form.scopeType === "ALL"
                          ? "bg-emerald-500/15 border-emerald-500 text-white shadow-sm"
                          : "bg-gray-50 dark:bg-[#1f1f2e] border-gray-200 dark:border-[#38384a] text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black text-xs text-emerald-400">Semua Produk</span>
                        {form.scopeType === "ALL" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">
                        Berlaku bebas di seluruh katalog
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, scopeType: "SELECTED" })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        form.scopeType === "SELECTED"
                          ? "bg-purple-500/15 border-purple-500 text-white shadow-sm"
                          : "bg-gray-50 dark:bg-[#1f1f2e] border-gray-200 dark:border-[#38384a] text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black text-xs text-purple-400">Produk Tertentu</span>
                        {form.scopeType === "SELECTED" && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">
                        Hanya produk yang dipilih di bawah
                      </span>
                    </button>
                  </div>

                  {/* Selector List Produk Khusus (Jika SELECTED) */}
                  {form.scopeType === "SELECTED" && (
                    <div className="space-y-2 p-3 bg-gray-50 dark:bg-[#13131c] rounded-2xl border border-gray-200 dark:border-[#2b2b3d]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Cari nama produk (misal: Spotify, ML)..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleSelectAllProducts}
                            className="text-[10px] font-bold px-2 py-1 bg-gray-200 dark:bg-[#252538] hover:bg-gray-300 dark:hover:bg-[#34344d] rounded-md text-carbon dark:text-white"
                          >
                            Pilih Semua
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSelectedProducts}
                            className="text-[10px] font-bold px-2 py-1 bg-gray-200 dark:bg-[#252538] hover:bg-gray-300 dark:hover:bg-[#34344d] rounded-md text-carbon dark:text-white"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 pt-1">
                        <span>Pilih produk yang diizinkan:</span>
                        <span className="text-purple-400">
                          {form.selectedSlugs.length} produk terpilih
                        </span>
                      </div>

                      {/* Scrollable list checkbox */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredProductsForModal.length === 0 ? (
                          <p className="text-center py-4 text-gray-500 text-[11px]">
                            Tidak ada produk yang cocok dengan pencarian.
                          </p>
                        ) : (
                          filteredProductsForModal.map((prod) => {
                            const isSelected = form.selectedSlugs.includes(prod.slug.toLowerCase());
                            return (
                              <div
                                key={prod.id}
                                onClick={() => handleToggleProductSlug(prod.slug)}
                                className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-500/20 border-purple-500 text-white"
                                    : "bg-white dark:bg-[#1a1a26] border-gray-200 dark:border-[#28283d] text-gray-300 hover:bg-gray-100 dark:hover:bg-[#232334]"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-black shrink-0 ${
                                      isSelected
                                        ? "bg-purple-600 border-purple-400 text-white"
                                        : "border-gray-500"
                                    }`}
                                  >
                                    {isSelected && "✓"}
                                  </div>
                                  <span className="text-xs font-bold truncate">{prod.name}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono shrink-0 ml-2">
                                  /{prod.slug}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Aktif */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="coupon-active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="coupon-active" className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Kupon langsung aktif dan siap digunakan pembeli
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-carbon dark:text-white rounded-xl font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#ffd731] hover:bg-[#ffe066] text-black font-black ink-border rounded-xl shadow-[2px_2px_0px_#000000] transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : editingCoupon ? "Perbarui Kupon" : "Simpan Kupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
