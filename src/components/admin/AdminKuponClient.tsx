"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, RefreshCw, CheckCircle2, AlertCircle, Percent, DollarSign } from "lucide-react";
import AdminTopbar from "./AdminTopbar";

interface Coupon {
  id?: string;
  code: string;
  type: string;
  value: number;
  maxDiscount?: number | null;
  minSpend?: number | null;
  active: boolean;
}

export default function AdminKuponClient({ session }: { session: any }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: 10,
    maxDiscount: 5000,
    minSpend: 0,
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Kupon ${form.code.toUpperCase()} berhasil disimpan!` });
        setShowModal(false);
        setForm({ code: "", type: "percent", value: 10, maxDiscount: 5000, minSpend: 0, active: true });
        fetchCoupons();
      } else {
        setMessage({ type: "error", text: data.message || "Gagal menyimpan kupon." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopbar
        title="Kupon Promo & Diskon"
        subtitle="Kelola kode voucher diskon dengan batas harga modal otomatis"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ffd731] text-black rounded-2xl ink-border shadow-[3px_3px_0px_#000000]">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
              Kupon Promo & Diskon
            </h1>
            <p className="text-xs text-gray-500 font-bold">
              Kelola kode voucher diskon dengan batas harga modal otomatis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1f1f2e] text-xs font-black text-carbon dark:text-white rounded-xl ink-border shadow-[2px_2px_0px_#000000]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white text-xs font-black rounded-xl ink-border shadow-[2px_2px_0px_#000000] hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Tambah Kupon
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border-2 ${
            message.type === "success"
              ? "bg-green-50 border-green-500 text-green-800 dark:bg-green-950/30 dark:text-green-300"
              : "bg-red-50 border-red-500 text-red-800 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid of Coupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="bg-white dark:bg-[#181824] ink-border rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000000] space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 font-mono font-black text-sm rounded-lg border border-yellow-400">
                {coupon.code}
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  coupon.active
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {coupon.active ? "Aktif" : "Nonaktif"}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-gray-800 dark:text-gray-200">
                Besar Potongan:{" "}
                <span className="font-mono text-blue-600 dark:text-blue-400 font-black">
                  {coupon.type === "percent" ? `${coupon.value}%` : `Rp ${coupon.value.toLocaleString("id-ID")}`}
                </span>
              </p>
              {coupon.maxDiscount && (
                <p className="text-gray-500 text-[11px]">
                  Maks Diskon: Rp {coupon.maxDiscount.toLocaleString("id-ID")}
                </p>
              )}
              {coupon.minSpend ? (
                <p className="text-gray-500 text-[11px]">
                  Min Belanja: Rp {coupon.minSpend.toLocaleString("id-ID")}
                </p>
              ) : null}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span>Proteksi Harga Supplier</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Kupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-6 max-w-md w-full shadow-[6px_6px_0px_#000000] space-y-4">
            <h3 className="text-base font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
              Tambah / Edit Kupon
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                  Kode Promo (Huruf Kapital)
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="CONTOH: PROMOHEMAT"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-mono uppercase font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Tipe Diskon
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-bold"
                  >
                    <option value="percent">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Nilai ({form.type === "percent" ? "%" : "Rp"})
                  </label>
                  <input
                    type="number"
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Maks Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Min Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    value={form.minSpend}
                    onChange={(e) => setForm({ ...form, minSpend: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1f1f2e] ink-border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-carbon dark:text-white rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#ffd731] text-black font-black ink-border rounded-xl shadow-[2px_2px_0px_#000000]"
                >
                  {submitting ? "Menyimpan..." : "Simpan Kupon"}
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
