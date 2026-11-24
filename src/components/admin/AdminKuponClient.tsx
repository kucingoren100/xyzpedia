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
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  History,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";

interface ProductItemOption {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  thumbnailUrl?: string;
  items?: ProductItemOption[];
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
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
  usedCount?: number;
  buyerCount?: number;
  totalSaved?: number;
}

function toDatetimeLocal(isoStr?: string | null) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function formatDateIndo(isoStr?: string | null) {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export default function AdminKuponClient({ session }: { session: any }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Active Tab: "ACTIVE" (Kupon Aktif) or "HISTORY" (Riwayat / Kadaluarsa)
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");

  // Form State
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: 10,
    maxDiscount: 5000,
    minSpend: 0,
    active: true,
    startsAt: "",
    endsAt: "",
    scopeType: "ALL" as "ALL" | "SELECTED",
    selectedTargets: [] as string[],
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
      startsAt: "",
      endsAt: "",
      scopeType: "ALL",
      selectedTargets: [],
    });
    setProductSearch("");
    setExpandedProducts({});
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);

    let scopeType: "ALL" | "SELECTED" = "ALL";
    let selectedTargets: string[] = [];

    if (coupon.applicableProducts && coupon.applicableProducts !== "ALL") {
      try {
        const parsed = JSON.parse(coupon.applicableProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          scopeType = "SELECTED";
          selectedTargets = parsed;
        }
      } catch {
        const split = coupon.applicableProducts.split(",").map((s) => s.trim());
        if (split.length > 0 && split[0].toLowerCase() !== "all") {
          scopeType = "SELECTED";
          selectedTargets = split;
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
      startsAt: toDatetimeLocal(coupon.startsAt),
      endsAt: toDatetimeLocal(coupon.endsAt),
      scopeType,
      selectedTargets,
    });
    setProductSearch("");
    setExpandedProducts({});
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

  const handleReactivateCoupon = async (coupon: Coupon) => {
    setActionLoading(`reactivate-${coupon.code}`);
    setMessage(null);
    try {
      // Extend expiry 7 days from now if expired, and mark active: true
      const newEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, active: true, endsAt: newEndsAt }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Kupon ${coupon.code} berhasil diaktifkan kembali (Masa aktif diperpanjang 7 hari)!`,
        });
        await fetchCouponsAndProducts();
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengaktifkan kupon." });
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

  const toggleExpandProduct = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProducts((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const isProductFullySelected = (prod: ProductOption) => {
    const prodKey = `PROD:${prod.slug.toLowerCase()}`;
    const legacyKey = prod.slug.toLowerCase();
    return form.selectedTargets.some(
      (t) => t.toLowerCase() === prodKey.toLowerCase() || t.toLowerCase() === legacyKey.toLowerCase()
    );
  };

  const getSelectedVariantCount = (prod: ProductOption) => {
    if (isProductFullySelected(prod)) return prod.items?.length || 1;
    const itemSkus = (prod.items || []).map((it) => it.sku.toLowerCase());
    return form.selectedTargets.filter((t) => {
      const lower = t.toLowerCase();
      const sku = lower.startsWith("sku:") ? lower.replace("sku:", "").trim() : lower;
      return itemSkus.includes(sku);
    }).length;
  };

  const isVariantSelected = (prod: ProductOption, item: ProductItemOption) => {
    if (isProductFullySelected(prod)) return true;
    const skuKey = `SKU:${item.sku.toLowerCase()}`;
    return form.selectedTargets.some(
      (t) =>
        t.toLowerCase() === skuKey.toLowerCase() ||
        t.toLowerCase() === item.sku.toLowerCase()
    );
  };

  const handleToggleEntireProduct = (prod: ProductOption) => {
    const prodKey = `PROD:${prod.slug.toLowerCase()}`;
    const legacyKey = prod.slug.toLowerCase();
    const itemSkus = (prod.items || []).map((it) => `sku:${it.sku.toLowerCase()}`);
    const bareSkus = (prod.items || []).map((it) => it.sku.toLowerCase());

    setForm((prev) => {
      const isAlreadySelected = prev.selectedTargets.some(
        (t) => t.toLowerCase() === prodKey.toLowerCase() || t.toLowerCase() === legacyKey.toLowerCase()
      );

      let next: string[];
      if (isAlreadySelected) {
        next = prev.selectedTargets.filter((t) => {
          const lower = t.toLowerCase();
          return (
            lower !== prodKey.toLowerCase() &&
            lower !== legacyKey.toLowerCase() &&
            !itemSkus.includes(lower) &&
            !bareSkus.includes(lower)
          );
        });
      } else {
        const cleaned = prev.selectedTargets.filter((t) => {
          const lower = t.toLowerCase();
          return (
            lower !== prodKey.toLowerCase() &&
            lower !== legacyKey.toLowerCase() &&
            !itemSkus.includes(lower) &&
            !bareSkus.includes(lower)
          );
        });
        next = [...cleaned, prodKey];
      }

      return { ...prev, selectedTargets: next };
    });
  };

  const handleToggleVariantSku = (prod: ProductOption, item: ProductItemOption) => {
    const skuKey = `SKU:${item.sku.toLowerCase()}`;
    const prodKey = `PROD:${prod.slug.toLowerCase()}`;
    const legacyKey = prod.slug.toLowerCase();
    const allVariants = prod.items || [];

    setForm((prev) => {
      const isEntireProdSelected = prev.selectedTargets.some(
        (t) => t.toLowerCase() === prodKey.toLowerCase() || t.toLowerCase() === legacyKey.toLowerCase()
      );

      let next: string[];

      if (isEntireProdSelected) {
        const otherVariants = allVariants
          .filter((it) => it.sku.toLowerCase() !== item.sku.toLowerCase())
          .map((it) => `SKU:${it.sku.toLowerCase()}`);

        const withoutProd = prev.selectedTargets.filter(
          (t) => t.toLowerCase() !== prodKey.toLowerCase() && t.toLowerCase() !== legacyKey.toLowerCase()
        );
        next = [...withoutProd, ...otherVariants];
      } else {
        const isSkuSelected = prev.selectedTargets.some(
          (t) =>
            t.toLowerCase() === skuKey.toLowerCase() ||
            t.toLowerCase() === item.sku.toLowerCase()
        );

        if (isSkuSelected) {
          next = prev.selectedTargets.filter(
            (t) =>
              t.toLowerCase() !== skuKey.toLowerCase() &&
              t.toLowerCase() !== item.sku.toLowerCase()
          );
        } else {
          const currentSelected = [...prev.selectedTargets, skuKey];
          const selectedCount = allVariants.filter((it) =>
            currentSelected.some(
              (t) =>
                t.toLowerCase() === `sku:${it.sku.toLowerCase()}` ||
                t.toLowerCase() === it.sku.toLowerCase()
            )
          ).length;

          if (allVariants.length > 0 && selectedCount === allVariants.length) {
            const withoutVariants = currentSelected.filter((t) => {
              const lower = t.toLowerCase();
              return !allVariants.some(
                (it) => lower === `sku:${it.sku.toLowerCase()}` || lower === it.sku.toLowerCase()
              );
            });
            next = [...withoutVariants, prodKey];
          } else {
            next = currentSelected;
          }
        }
      }

      return { ...prev, selectedTargets: next };
    });
  };

  const handleSelectAllProducts = () => {
    const all = products.map((p) => `PROD:${p.slug.toLowerCase()}`);
    setForm((prev) => ({ ...prev, selectedTargets: all }));
  };

  const handleClearSelectedProducts = () => {
    setForm((prev) => ({ ...prev, selectedTargets: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (form.scopeType === "SELECTED" && form.selectedTargets.length === 0) {
      alert("Harap pilih minimal 1 produk atau varian jika membatasi kupon.");
      setSubmitting(false);
      return;
    }

    const applicableProducts =
      form.scopeType === "ALL" ? "ALL" : JSON.stringify(form.selectedTargets);

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
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
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

  // Helper status kupon (Aktif, Mendatang, Kadaluarsa, Nonaktif)
  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    if (coupon.endsAt && new Date(coupon.endsAt) < now) {
      return {
        key: "EXPIRED",
        label: "Kadaluarsa",
        color: "bg-red-500/15 text-red-400 border-red-500/40",
        isExpired: true,
      };
    }
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return {
        key: "UPCOMING",
        label: "Mendatang",
        color: "bg-blue-500/15 text-blue-400 border-blue-500/40",
        isExpired: false,
      };
    }
    if (!coupon.active) {
      return {
        key: "INACTIVE",
        label: "Nonaktif",
        color: "bg-gray-500/15 text-gray-400 border-gray-600",
        isExpired: false,
      };
    }
    return {
      key: "ACTIVE",
      label: "Aktif",
      color: "bg-emerald-500/15 text-[#55db9c] border-emerald-500/40",
      isExpired: false,
    };
  };

  // Filter Active vs History
  const activeCoupons = coupons.filter((c) => {
    const status = getCouponStatus(c);
    return status.key === "ACTIVE" || status.key === "UPCOMING";
  });

  const historyCoupons = coupons.filter((c) => {
    const status = getCouponStatus(c);
    return status.key === "EXPIRED" || status.key === "INACTIVE";
  });

  const displayedCoupons = activeTab === "ACTIVE" ? activeCoupons : historyCoupons;

  // Helper untuk parsing produk & varian kupon untuk kartu tampilan
  const getCouponApplicableInfo = (coupon: Coupon) => {
    if (!coupon.applicableProducts || coupon.applicableProducts === "ALL") {
      return { isAll: true, totalCount: 0, labels: ["Semua Produk (Global)"] };
    }

    let targets: string[] = [];
    try {
      targets = JSON.parse(coupon.applicableProducts);
    } catch {
      targets = coupon.applicableProducts.split(",").map((s) => s.trim());
    }

    if (!Array.isArray(targets) || targets.length === 0) {
      return { isAll: true, totalCount: 0, labels: ["Semua Produk (Global)"] };
    }

    const labels: string[] = [];

    for (const raw of targets) {
      const target = raw.trim();
      const lower = target.toLowerCase();

      if (lower.startsWith("sku:")) {
        const sku = lower.replace("sku:", "").trim();
        let found = false;
        for (const p of products) {
          const it = (p.items || []).find((item) => item.sku.toLowerCase() === sku);
          if (it) {
            labels.push(`${p.name} (${it.name})`);
            found = true;
            break;
          }
        }
        if (!found) labels.push(`Varian SKU: ${sku}`);
      } else {
        const prodSlug = lower.replace("prod:", "").trim();
        const p = products.find((prod) => prod.slug.toLowerCase() === prodSlug);
        labels.push(p ? `${p.name} (Semua Varian)` : prodSlug);
      }
    }

    return {
      isAll: false,
      totalCount: targets.length,
      labels,
    };
  };

  const filteredProductsForModal = products.filter((p) => {
    const q = productSearch.toLowerCase();
    if (p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)) return true;
    return (p.items || []).some(
      (it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopbar
        title="Kupon Promo & Diskon"
        subtitle="Kelola kode voucher diskon dengan batas harga modal, batasan produk, dan masa aktif kedaluwarsa"
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
                Kelola kode kupon, masa aktif, proteksi modal, dan batasan produk yang berlaku.
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

        {/* Tab Switcher: Kupon Aktif vs Riwayat / Kadaluarsa */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#2b2b3f] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "ACTIVE"
                ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_#000000]"
                : "bg-white dark:bg-[#1a1a26] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Kupon Aktif ({activeCoupons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "HISTORY"
                ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_#000000]"
                : "bg-white dark:bg-[#1a1a26] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat & Kadaluarsa ({historyCoupons.length})</span>
          </button>
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
        {!loading && displayedCoupons.length === 0 && (
          <div className="bg-[#181824] border-2 border-[#2b2b3f] rounded-3xl p-10 text-center space-y-4 shadow-[4px_4px_0px_0px_#000000]">
            <div className="w-20 h-20 mx-auto">
              <img
                src="/brand/stiker/xyzi-stiker-berpikir.png"
                alt="XYZI Berpikir"
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white font-[var(--font-bricolage)]">
                {activeTab === "ACTIVE" ? "Tidak Ada Kupon Aktif" : "Tidak Ada Riwayat Kupon"}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {activeTab === "ACTIVE"
                  ? "Semua kupon sedang nonaktif atau telah kadaluarsa. Buat kupon baru untuk menarik pembeli."
                  : "Belum ada kupon yang kadaluarsa atau dinonaktifkan."}
              </p>
            </div>
            {activeTab === "ACTIVE" && (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 bg-[#ffd731] text-black text-xs font-black rounded-xl ink-border shadow-[2px_2px_0px_#000000] inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Buat Kupon Baru</span>
              </button>
            )}
          </div>
        )}

        {/* Grid of Coupons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedCoupons.map((coupon) => {
            const applicableInfo = getCouponApplicableInfo(coupon);
            const statusInfo = getCouponStatus(coupon);
            const isDeleting = actionLoading === `delete-${coupon.code}`;
            const isToggling = actionLoading === `toggle-${coupon.code}`;
            const isReactivating = actionLoading === `reactivate-${coupon.code}`;

            return (
              <div
                key={coupon.code}
                className={`bg-white dark:bg-[#181824] ink-border dark:border-[#33334d] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000] space-y-4 relative overflow-hidden flex flex-col justify-between ${
                  statusInfo.key === "EXPIRED" ? "opacity-90 border-red-500/30" : ""
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Code & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 font-mono font-black text-sm rounded-lg border border-yellow-400/50">
                      {coupon.code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>

                      {/* Quick Toggle Active Button (if not expired) */}
                      {!statusInfo.isExpired && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon.code, coupon.active)}
                          disabled={isToggling}
                          title="Klik untuk ubah status aktif/nonaktif"
                          className="text-gray-400 hover:text-white p-1 rounded-md"
                        >
                          <Power className={`w-3.5 h-3.5 ${coupon.active ? "text-[#55db9c]" : "text-gray-500"}`} />
                        </button>
                      )}
                    </div>
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

                  {/* Masa Aktif Kupon */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#252538] space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Masa Aktif Kupon:
                    </span>
                    <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {coupon.startsAt || coupon.endsAt ? (
                        <span>
                          {coupon.startsAt ? formatDateIndo(coupon.startsAt) : "Mulai sekarang"} s/d{" "}
                          <strong className={statusInfo.isExpired ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                            {coupon.endsAt ? formatDateIndo(coupon.endsAt) : "Selamanya"}
                          </strong>
                        </span>
                      ) : (
                        <span className="text-gray-400">Berlaku Selamanya (Tanpa Batas Waktu)</span>
                      )}
                    </div>
                  </div>

                  {/* Statistik Pemakaian Pembeli */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#252538] space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Pemakaian Kupon:
                    </span>
                    {coupon.buyerCount && coupon.buyerCount > 0 ? (
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-black">
                          <Users className="w-3.5 h-3.5" />
                          <span>{coupon.buyerCount} Pembeli ({coupon.usedCount || 0}× Dipakai)</span>
                        </span>
                        <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                          Hemat Rp {(coupon.totalSaved || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gray-500/10 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span>Belum ada pembeli yang pakai kupon ini</span>
                      </div>
                    )}
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
                          <span>Hanya {applicableInfo.totalCount} Target Pilihan</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate font-medium">
                          {applicableInfo.labels.slice(0, 3).join(", ")}
                          {applicableInfo.labels.length > 3 && ` +${applicableInfo.labels.length - 3} lainnya`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Edit, Reaktifkan & Hapus */}
                <div className="pt-3 border-t border-gray-200 dark:border-[#2b2b3f] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                    <span>Proteksi Modal</span>
                    <CheckCircle2 className="w-3 h-3 text-[#55db9c]" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Reactivate for Expired/Inactive in History */}
                    {statusInfo.isExpired && (
                      <button
                        type="button"
                        onClick={() => handleReactivateCoupon(coupon)}
                        disabled={isReactivating}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg ink-border text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                        title="Perpanjang 7 hari & aktifkan kembali"
                      >
                        <RefreshCw className={`w-3 h-3 ${isReactivating ? "animate-spin" : ""}`} />
                        <span>Reaktifkan</span>
                      </button>
                    )}

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

        {/* Modal Tambah / Edit Kupon (Mobile-Optimized with Internal Scroll) */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl max-w-lg w-full shadow-[8px_8px_0px_#000000] flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
              {/* Modal Header (Fixed shrink-0) */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4 sm:p-5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#ffd731] text-black rounded-xl ink-border">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
                    {editingCoupon ? `Edit Kupon: ${editingCoupon.code}` : "Tambah Kupon Promo Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#252538] flex items-center justify-center text-gray-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form Body (Scrollable inside) */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs">
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-mono uppercase font-black text-xs sm:text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Gunakan huruf besar tanpa spasi (contoh: HEMAT5, SPOTIFYVIP).
                  </p>
                </div>

                {/* Tipe & Nilai Diskon */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-black mb-1 text-gray-700 dark:text-gray-300">
                      Tipe Diskon
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-bold cursor-pointer"
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
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Maks Diskon & Min Belanja */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-black mb-1 text-gray-700 dark:text-gray-300">
                      Maks Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={form.maxDiscount || ""}
                      placeholder="0 = Tanpa batas"
                      onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-mono"
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
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* MASA AKTIF KUPON (FITUR MASA BERLAKU & KADALUARSA) */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <label className="font-black text-gray-800 dark:text-gray-200">
                      Masa Aktif & Kedaluwarsa
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">
                        Mulai Berlaku (Opsional)
                      </label>
                      <input
                        type="datetime-local"
                        value={form.startsAt}
                        onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl text-xs font-mono"
                      />
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        Kosongkan jika langsung aktif
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">
                        Berakhir Pada / Kadaluarsa (Opsional)
                      </label>
                      <input
                        type="datetime-local"
                        value={form.endsAt}
                        onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl text-xs font-mono"
                      />
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        Kosongkan jika berlaku selamanya
                      </span>
                    </div>
                  </div>
                </div>

                {/* CAKUPAN PRODUK (FITUR SPESIFIK USER - MOBILE OPTIMIZED) */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2.5">
                  <div>
                    <label className="block font-black text-gray-800 dark:text-gray-200">
                      Cakupan Produk yang Berlaku
                    </label>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Tentukan apakah kupon ini bebas dipakai untuk semua produk atau dibatasi hanya untuk produk tertentu.
                    </p>
                  </div>

                  {/* Radio Opsi Cakupan */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, scopeType: "ALL" })}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        form.scopeType === "ALL"
                          ? "bg-emerald-500/15 border-emerald-500 text-white shadow-sm"
                          : "bg-gray-50 dark:bg-[#1f1f2e] border-gray-200 dark:border-[#38384a] text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black text-xs text-emerald-400">Semua Produk</span>
                        {form.scopeType === "ALL" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        Bebas di seluruh katalog
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, scopeType: "SELECTED" })}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        form.scopeType === "SELECTED"
                          ? "bg-purple-500/15 border-purple-500 text-white shadow-sm"
                          : "bg-gray-50 dark:bg-[#1f1f2e] border-gray-200 dark:border-[#38384a] text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black text-xs text-purple-400">Produk Tertentu</span>
                        {form.scopeType === "SELECTED" && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        Hanya target di bawah
                      </span>
                    </button>
                  </div>

                  {/* Selector List Produk Khusus (Mobile-Optimized Compact Accordion) */}
                  {form.scopeType === "SELECTED" && (
                    <div className="space-y-2 p-2.5 bg-gray-50 dark:bg-[#13131c] rounded-2xl border border-gray-200 dark:border-[#2b2b3d]">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="relative flex-1">
                          <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Cari produk / game..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1.5 bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={handleSelectAllProducts}
                            className="text-[9px] font-bold px-2 py-1 bg-gray-200 dark:bg-[#252538] hover:bg-gray-300 dark:hover:bg-[#34344d] rounded-md text-carbon dark:text-white cursor-pointer"
                          >
                            Semua
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSelectedProducts}
                            className="text-[9px] font-bold px-2 py-1 bg-gray-200 dark:bg-[#252538] hover:bg-gray-300 dark:hover:bg-[#34344d] rounded-md text-carbon dark:text-white cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                        <span>Pilih target yang diizinkan:</span>
                        <span className="text-purple-400">
                          {form.selectedTargets.length} dipilih
                        </span>
                      </div>

                      {/* Compact Scrollable list accordion (max-h-40 on mobile, max-h-52 on desktop) */}
                      <div className="max-h-40 sm:max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                        {filteredProductsForModal.length === 0 ? (
                          <p className="text-center py-3 text-gray-500 text-[10px]">
                            Tidak ada produk yang cocok.
                          </p>
                        ) : (
                          filteredProductsForModal.map((prod) => {
                            const isAllSelected = isProductFullySelected(prod);
                            const selectedCount = getSelectedVariantCount(prod);
                            const hasItems = !!(prod.items && prod.items.length > 0);
                            const isExpanded = !!(
                              expandedProducts[prod.slug] ||
                              (productSearch.trim().length > 0 && hasItems)
                            );

                            return (
                              <div
                                key={prod.id}
                                className="rounded-xl border border-gray-200 dark:border-[#28283d] overflow-hidden bg-white dark:bg-[#1a1a26]"
                              >
                                {/* Header Bar Produk */}
                                <div className="flex items-center justify-between p-2 gap-2 hover:bg-gray-50 dark:hover:bg-[#20202f] transition-colors">
                                  <div
                                    onClick={() => handleToggleEntireProduct(prod)}
                                    className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                                  >
                                    <div
                                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] font-black shrink-0 transition-colors ${
                                        isAllSelected
                                          ? "bg-purple-600 border-purple-400 text-white"
                                          : selectedCount > 0
                                          ? "bg-purple-600/30 border-purple-400 text-purple-300"
                                          : "border-gray-500 text-transparent"
                                      }`}
                                    >
                                      {isAllSelected ? "✓" : selectedCount > 0 ? "−" : ""}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11px] font-bold text-carbon dark:text-white truncate">
                                          {prod.name}
                                        </span>
                                        <span className="text-[9px] text-gray-400 font-mono">
                                          /{prod.slug}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-gray-500">
                                        {isAllSelected
                                          ? "Semua varian terpilih"
                                          : selectedCount > 0
                                          ? `${selectedCount} dari ${prod.items?.length || 0} varian`
                                          : `${prod.items?.length || 0} varian`}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Toggle Expand Varian */}
                                  {hasItems && (
                                    <button
                                      type="button"
                                      onClick={(e) => toggleExpandProduct(prod.slug, e)}
                                      className="px-2 py-0.5 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#323249] rounded-md text-gray-600 dark:text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-[9px] font-bold"
                                    >
                                      <span>{isExpanded ? "Tutup" : "Varian"}</span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* List Varian Spesifik (Accordion Drawer) */}
                                {hasItems && isExpanded && (
                                  <div className="border-t border-gray-100 dark:border-[#28283d] bg-gray-50/70 dark:bg-[#14141e] p-1.5 space-y-1">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1 pb-0.5">
                                      Pilih Varian:
                                    </div>
                                    {prod.items!.map((it) => {
                                      const isChecked = isVariantSelected(prod, it);
                                      return (
                                        <div
                                          key={it.id || it.sku}
                                          onClick={() => handleToggleVariantSku(prod, it)}
                                          className={`flex items-center justify-between p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                            isChecked
                                              ? "bg-purple-500/15 border-purple-500/60 text-carbon dark:text-white"
                                              : "bg-white dark:bg-[#1a1a26] border-gray-200 dark:border-[#252538] text-gray-400 hover:bg-gray-100 dark:hover:bg-[#20202e]"
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                            <div
                                              className={`w-3 h-3 rounded flex items-center justify-center border text-[8px] font-black shrink-0 ${
                                                isChecked
                                                  ? "bg-purple-600 border-purple-400 text-white"
                                                  : "border-gray-500 text-transparent"
                                              }`}
                                            >
                                              {isChecked && "✓"}
                                            </div>
                                            <span className="text-[10px] font-bold truncate">
                                              {it.name}
                                            </span>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <span className="text-[10px] font-black text-carbon dark:text-yellow-400 font-mono block">
                                              Rp {it.price.toLocaleString("id-ID")}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Aktif Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="coupon-active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="coupon-active" className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer text-xs">
                    Kupon langsung aktif dan siap digunakan pembeli
                  </label>
                </div>

                {/* Actions (Fixed bottom) */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-carbon dark:text-white rounded-xl font-bold cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#ffd731] hover:bg-[#ffe066] text-black font-black ink-border rounded-xl shadow-[2px_2px_0px_#000000] transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50 text-xs"
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
