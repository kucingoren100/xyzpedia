"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  X,
  Edit2,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  badgeText: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminBannerClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/katalog");
  const [badgeText, setBadgeText] = useState("PROMO SPESIAL");
  const [orderNum, setOrderNum] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setImageUrl("");
    setLinkUrl("/katalog");
    setBadgeText("PROMO SPESIAL");
    setOrderNum(banners.length + 1);
    setIsActive(true);
    setEditingBanner(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || "/katalog");
    setBadgeText(b.badgeText || "PROMO");
    setOrderNum(b.order);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBanner) {
        // PATCH
        const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subtitle,
            imageUrl,
            linkUrl,
            badgeText,
            order: orderNum,
            isActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBanners((prev) =>
            prev.map((b) => (b.id === editingBanner.id ? data.banner : b))
          );
          setActionMsg(`✓ Banner "${title}" berhasil diperbarui.`);
          setIsModalOpen(false);
        } else {
          alert("Gagal memperbarui: " + data.message);
        }
      } else {
        // POST
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            subtitle,
            imageUrl,
            linkUrl,
            badgeText,
            order: orderNum,
            isActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBanners((prev) => [data.banner, ...prev]);
          setActionMsg(`✓ Banner "${title}" berhasil ditambahkan.`);
          setIsModalOpen(false);
        } else {
          alert("Gagal menambahkan: " + data.message);
        }
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (b: Banner) => {
    const next = !b.isActive;
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, isActive: next } : item))
        );
        setActionMsg(
          next
            ? `✓ Banner "${b.title}" diaktifkan (tampil di beranda).`
            : `✓ Banner "${b.title}" dinonaktifkan.`
        );
      }
    } catch {
      alert("Gagal mengubah status banner.");
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!confirm(`Hapus banner "${b.title}" secara permanen?`)) return;

    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((item) => item.id !== b.id));
        setActionMsg(`✓ Banner "${b.title}" telah dihapus.`);
      } else {
        alert("Gagal menghapus: " + data.message);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopbar
        title="Kelola Banner Promo Beranda"
        subtitle="Atur gambar slide banner promo, judul, deskripsi, dan link tujuan di storefront pembeli"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Action feedback message */}
        {actionMsg && (
          <div className="p-3.5 bg-[#55db9c]/20 border border-[#55db9c] text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>{actionMsg}</span>
            <button
              onClick={() => setActionMsg(null)}
              className="p-1 hover:bg-black/10 rounded-lg text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="bg-white dark:bg-[#181824] ink-border rounded-2xl p-4 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ffd731] inline-block ink-border" />
            <h2 className="text-sm font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
              Daftar Banner Promo ({banners.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#ffd731] hover:bg-[#ffe366] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Banner Baru</span>
          </button>
        </div>

        {/* Banner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`bg-white dark:bg-[#181824] ink-border rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] flex flex-col transition-all ${
                !b.isActive ? "opacity-60 bg-gray-50 dark:bg-[#12121c]" : ""
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative aspect-[16/7] w-full bg-gray-100 dark:bg-[#12121a] overflow-hidden border-b-2 border-black">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800";
                  }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  {b.badgeText && (
                    <span className="px-2 py-0.5 bg-[#ffd731] text-black text-[9px] font-black uppercase ink-border rounded-md shadow-[1px_1px_0px_#000]">
                      {b.badgeText}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase ink-border rounded-md">
                    Urutan #{b.order}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(b)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ink-border shadow-[1px_1px_0px_#000] cursor-pointer ${
                      b.isActive
                        ? "bg-[#55db9c] text-black"
                        : "bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5]"
                    }`}
                  >
                    {b.isActive ? "ONLINE" : "OFFLINE"}
                  </button>
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-[var(--font-bricolage)] text-sm font-black uppercase text-carbon dark:text-white line-clamp-1">
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {b.subtitle}
                    </p>
                  )}
                  <div className="pt-1 text-[11px] font-mono text-gray-400 truncate flex items-center gap-1">
                    <span className="font-bold">Link:</span>
                    <span className="truncate text-blue-600 dark:text-blue-400">{b.linkUrl}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="flex-1 py-1.5 px-3 bg-white dark:bg-[#20202e] hover:bg-gray-100 dark:hover:bg-[#2a2a3c] text-carbon dark:text-white rounded-xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {b.linkUrl && (
                    <Link
                      href={b.linkUrl}
                      target="_blank"
                      className="p-1.5 bg-white dark:bg-[#20202e] hover:bg-gray-100 text-gray-600 dark:text-gray-300 rounded-xl ink-border shadow-[1.5px_1.5px_0px_#000]"
                      title="Buka Link Tujuan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(b)}
                    className="p-1.5 bg-[#ffdad6] dark:bg-[#3d141a] hover:bg-red-200 text-[#93000a] dark:text-[#fca5a5] rounded-xl ink-border shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                    title="Hapus Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {banners.length === 0 && (
          <div className="bg-white dark:bg-[#181824] ink-border rounded-2xl p-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-[var(--font-bricolage)] text-base font-black uppercase text-carbon dark:text-white">
              Belum Ada Banner Promo
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Tambahkan banner untuk menampilkan promo spesial, diskon game, atau event musiman di beranda toko.
            </p>
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#181824] ink-border-thick rounded-3xl p-6 max-w-lg w-full shadow-[6px_6px_0px_#000] space-y-5 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  <h3 className="font-[var(--font-bricolage)] text-base font-black uppercase text-carbon dark:text-white">
                    {editingBanner ? "Edit Banner Promo" : "Tambah Banner Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#20202e] hover:bg-red-100 text-gray-500 hover:text-red-600 ink-border flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                    Judul Banner *:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Flash Sale Weekly Diamond Pass"
                    className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                    Deskripsi Singkat / Subtitle:
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Contoh: Diskon 20% khusus minggu ini, proses otomatis 1 detik!"
                    className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                    URL Gambar Banner (Rasio 16:9 atau Landscape) *:
                  </label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau link gambar"
                    className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-mono text-carbon dark:text-white"
                  />
                  {imageUrl && (
                    <div className="mt-2 aspect-[16/6] rounded-xl overflow-hidden ink-border bg-gray-100">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Link Tujuan (Redirect):
                    </label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="/produk/mobile-legends"
                      className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Badge Stiker:
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="PROMO / TERLARIS"
                      className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Nomor Urutan Tampil:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={orderNum}
                      onChange={(e) => setOrderNum(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="isActiveCheckbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded ink-border accent-[#ffd731] cursor-pointer"
                    />
                    <label
                      htmlFor="isActiveCheckbox"
                      className="text-xs font-bold text-carbon dark:text-white cursor-pointer select-none"
                    >
                      Aktifkan di Beranda
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#20202e] rounded-xl ink-border text-xs font-black uppercase"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#ffd731] hover:bg-[#ffe366] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    {loading ? "Menyimpan..." : editingBanner ? "Simpan Perubahan" : "Publikasikan Banner"}
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
