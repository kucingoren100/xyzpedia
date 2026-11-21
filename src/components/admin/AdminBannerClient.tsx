"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
  Edit2,
  UploadCloud,
  Camera,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";
import { compressImageClient } from "@/lib/imageCompressor";

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

  // File Upload State & Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Streamlined Form State (Only Image, Link, Order & Active)
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/katalog");
  const [orderNum, setOrderNum] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setImageUrl("");
    setLinkUrl("/katalog");
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
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || "/katalog");
    setOrderNum(b.order);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleUploadBannerFile = async (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Ukuran file gambar maksimal 8MB!");
      return;
    }

    setIsUploading(true);
    try {
      const optimizedFile = await compressImageClient(file, 1920, 1080, 0.88);
      const formData = new FormData();
      formData.append("file", optimizedFile);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        setActionMsg("File gambar banner berhasil diupload!");
      } else {
        alert("Gagal upload gambar: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Gagal upload gambar: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Silakan pilih file gambar banner dari perangkat atau masukkan URL gambar!");
      return;
    }
    setLoading(true);

    const autoTitle = editingBanner ? editingBanner.title : `Banner #${orderNum}`;

    try {
      if (editingBanner) {
        // PATCH
        const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: autoTitle,
            imageUrl,
            linkUrl,
            order: orderNum,
            isActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBanners((prev) =>
            prev.map((b) => (b.id === editingBanner.id ? data.banner : b))
          );
          setActionMsg("Gambar banner promo berhasil diperbarui!");
          setIsModalOpen(false);
        } else {
          alert("Gagal menyimpan: " + (data.error || data.message));
        }
      } else {
        // POST
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: autoTitle,
            imageUrl,
            linkUrl,
            order: orderNum,
            isActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBanners((prev) => [...prev, data.banner].sort((a, b) => a.order - b.order));
          setActionMsg("Banner baru berhasil ditambahkan!");
          setIsModalOpen(false);
        } else {
          alert("Gagal menambahkan: " + (data.error || data.message));
        }
      }
    } catch (err: any) {
      alert("Koneksi gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!confirm(`Hapus banner urutan #${b.order} secara permanen?`)) return;

    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((item) => item.id !== b.id));
        setActionMsg(`Banner berhasil dihapus.`);
      } else {
        alert("Gagal menghapus: " + data.message);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleToggle = async (b: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, isActive: !b.isActive } : item))
        );
        setActionMsg(`Status banner diubah menjadi ${!b.isActive ? "ONLINE" : "NONAKTIF"}.`);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleReorder = async (b: Banner, direction: "up" | "down") => {
    const currentOrder = b.order;
    const targetOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    if (targetOrder < 1) return;

    try {
      const res = await fetch(`/api/admin/banners/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: targetOrder }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = banners.map((item) =>
          item.id === b.id ? { ...item, order: targetOrder } : item
        );
        setBanners(updated.sort((x, y) => x.order - y.order));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminTopbar
        title="Kelola Banner Promo Beranda"
        subtitle="Atur foto banner promo beranda, ganti gambar, urutan tampil, dan link tujuan saat diklik pembeli"
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Action feedback message */}
        {actionMsg && (
          <div className="p-3.5 bg-[#55db9c]/20 border border-[#55db9c] text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>{actionMsg}</span>
            <button
              onClick={() => setActionMsg(null)}
              className="p-1 hover:bg-black/10 rounded-lg text-xs cursor-pointer"
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
              <div
                onClick={() => openEditModal(b)}
                className="group relative aspect-[16/7] w-full bg-black overflow-hidden border-b-2 border-black cursor-pointer"
                title="Klik untuk mengganti gambar banner ini"
              >
                <img
                  src={b.imageUrl}
                  alt={`Banner #${b.order}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e: any) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800";
                  }}
                />

                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 bg-[#ffd731] text-black text-[10px] font-black uppercase ink-border rounded-md shadow-[1px_1px_0px_#000]">
                    Urutan #{b.order}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(b);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ink-border shadow-[1px_1px_0px_#000] cursor-pointer ${
                      b.isActive
                        ? "bg-[#55db9c] text-black"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {b.isActive ? "ONLINE" : "OFFLINE"}
                  </button>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-black text-xs uppercase tracking-wider">
                  <Camera className="w-4 h-4" />
                  <span>Klik untuk Ganti Gambar</span>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-gray-300">
                  <span className="text-[11px] font-mono text-gray-500 truncate max-w-[200px]">
                    Link: {b.linkUrl || "/katalog"}
                  </span>
                  <span className="text-[10px] uppercase font-black text-gray-400">
                    {b.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleReorder(b, "up")}
                      disabled={b.order <= 1}
                      className="p-1.5 bg-gray-100 dark:bg-[#20202e] hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-lg ink-border disabled:opacity-40 cursor-pointer"
                      title="Naikkan Urutan"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(b, "down")}
                      className="p-1.5 bg-gray-100 dark:bg-[#20202e] hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-lg ink-border cursor-pointer"
                      title="Turunkan Urutan"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="flex-1 py-1.5 px-3 bg-white dark:bg-[#20202e] hover:bg-gray-100 dark:hover:bg-[#2a2a3c] text-carbon dark:text-white rounded-xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ganti Gambar</span>
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
              Tambahkan gambar banner untuk menampilkan event atau promo di beranda toko.
            </p>
          </div>
        )}

        {/* Simplified Create / Edit Modal (Only Image, Link, Order & Active) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#181824] ink-border-thick rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[6px_6px_0px_#000] space-y-5 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  <h3 className="font-[var(--font-bricolage)] text-base font-black uppercase text-carbon dark:text-white">
                    {editingBanner ? "Ganti Gambar Banner Promo" : "Tambah Banner Promo Baru"}
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
                {/* 1. Upload & Select Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block">
                      Pilih Gambar Banner *:
                    </label>
                    <span className="text-[10px] font-bold text-gray-400">JPG, PNG, WEBP (Maks. 5MB)</span>
                  </div>

                  {/* Hidden file input for native device upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadBannerFile(file);
                    }}
                  />

                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-3 px-4 bg-[#ffd731] hover:bg-[#ffe366] text-black font-black text-xs uppercase tracking-wider rounded-xl ink-border flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                        <span>Mengupload File Gambar...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                        <span>{imageUrl ? "Ganti File Gambar dari Perangkat" : "Pilih File Gambar dari Perangkat"}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 my-1">
                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">atau input URL langsung</span>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                  </div>

                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... atau /uploads/..."
                    className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-mono text-carbon dark:text-white"
                  />

                  {/* Live Image Preview with click-to-change overlay */}
                  {imageUrl && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative mt-2 aspect-[16/7] rounded-xl overflow-hidden ink-border bg-black cursor-pointer shadow-[2px_2px_0px_#000]"
                      title="Klik untuk memilih file gambar baru dari perangkat"
                    >
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-black text-xs uppercase tracking-wider">
                        <Camera className="w-4 h-4" />
                        <span>Klik untuk Ganti Foto</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Link Tujuan (Redirect) */}
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                    Link Tujuan Ketika Banner Diklik:
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Contoh: /katalog atau /produk/mobile-legends"
                    className="w-full px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Saat pembeli klik banner di beranda, mereka langsung diarahkan ke link ini.
                  </span>
                </div>

                {/* 3. Nomor Urutan & Status Aktif */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
                      Nomor Urutan Slide:
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

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#20202e] hover:bg-gray-200 text-carbon dark:text-white rounded-xl ink-border text-xs font-black uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isUploading}
                    className="px-5 py-2 bg-[#ffd731] hover:bg-[#ffe366] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Banner</span>
                    )}
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
