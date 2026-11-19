"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Save,
  Gamepad2,
  Sparkles,
  Smartphone,
  Ticket,
  Clock,
  Eye,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Sliders,
  HelpCircle,
  X,
  ExternalLink,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";
import {
  WebConditionSettings,
  DEFAULT_WEB_CONDITION,
  PRESET_OPTIONS,
  MaintenancePreset,
} from "@/lib/webCondition";

function PopToggle({
  checked,
  onChange,
  disabled = false,
  label,
  activeColor = "bg-[#fb4903]",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-black transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? activeColor : "bg-gray-200 dark:bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="sr-only">{label || "Toggle"}</span>
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white border border-black/40 shadow-sm transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function AdminKondisiWebClient() {
  const [condition, setCondition] = useState<WebConditionSettings>(DEFAULT_WEB_CONDITION);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load existing configuration from DB on mount
  const fetchCondition = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings/web-condition");
      const data = await res.json();
      if (data.success && data.condition) {
        setCondition(data.condition);
      }
    } catch (err) {
      console.error("Gagal memuat kondisi web:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCondition();
  }, []);

  // Handle Preset Selection
  const applyPreset = (presetKey: MaintenancePreset) => {
    const preset = PRESET_OPTIONS[presetKey];
    if (!preset) return;

    setCondition((prev) => ({
      ...prev,
      preset: presetKey,
      title: preset.title,
      badge: preset.badge,
      description: preset.description,
      secondaryText: preset.secondaryText,
      estimatedTime: preset.estimatedTime,
    }));
  };

  // Handle Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/settings/web-condition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(condition),
      });
      const data = await res.json();

      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(data.message || "Gagal menyimpan kondisi web.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const isAnyCategoryMaintenance = Object.values(condition.categories).some(Boolean);

  return (
    <div className="min-h-screen bg-[#f4f4f0] dark:bg-[#0f0f15] text-carbon dark:text-gray-100 flex flex-col">
      <AdminTopbar title="Kondisi Web & Status Pemeliharaan" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner Status Global */}
        <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ink-border shadow-[2px_2px_0px_#000] ${
                  condition.fullSiteLock
                    ? "bg-red-500 text-white"
                    : isAnyCategoryMaintenance
                    ? "bg-[#ffd731] text-black"
                    : "bg-[#55db9c] text-black"
                }`}
              >
                {condition.fullSiteLock ? (
                  <Lock className="w-6 h-6 stroke-[2.5]" />
                ) : isAnyCategoryMaintenance ? (
                  <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black uppercase font-[var(--font-bricolage)] text-carbon dark:text-white">
                    Pusat Kendali Operasional Web
                  </h1>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ink-border ${
                      condition.fullSiteLock
                        ? "bg-red-500 text-white"
                        : isAnyCategoryMaintenance
                        ? "bg-amber-400 text-black"
                        : "bg-[#55db9c] text-black"
                    }`}
                  >
                    {condition.fullSiteLock
                      ? "Full Site Locked"
                      : isAnyCategoryMaintenance
                      ? "Maintenance Aktif"
                      : "Semua Normal (Live)"}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
                  Kelola status buka/tutup transaksi pembelian per kategori atau menyeluruh. Perubahan langsung aktif di web pembeli tanpa perlu build atau restart server.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={fetchCondition}
                disabled={isLoading}
                title="Refresh Status"
                className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#20202e] dark:hover:bg-[#2b2b3d] text-carbon dark:text-white rounded-xl ink-border text-xs font-black transition-transform active:scale-95 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#55db9c] hover:bg-[#43cd8c] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer transition-transform hover:scale-102 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {saveSuccess && (
            <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Kondisi web berhasil diperbarui dan telah diterapkan ke seluruh halaman pembeli secara instan!</span>
            </div>
          )}
          {saveError && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-950/70 border border-red-500 rounded-xl text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}
        </section>

        {/* Form Container: 2 Kolom (Settings Kiri, Live Preview Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sisi Kiri: Controls & Settings (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* SEKSI 1: KONTROL PER KATEGORI (GRANULAR SWITCH) */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#ffd731] text-black rounded-lg ink-border">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    1. Kendali Pemeliharaan per Kategori
                  </h2>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500">
                  Aktifkan / Nonaktifkan
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kategori yang di-set <strong>Maintenance (ON)</strong> akan memunculkan pop-up pemberitahuan pemeliharaan saat pembeli mengklik tombol bayar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* 1. Game Top-Up */}
                <div
                  className={`p-4 rounded-2xl ink-border transition-all flex items-center justify-between ${
                    condition.categories["game-topup"]
                      ? "bg-amber-50 dark:bg-[#201d18] border-amber-500 shadow-[2px_2px_0px_#f59e0b]"
                      : "bg-[#fbfbfd] dark:bg-[#1f1f2e] border-gray-300 dark:border-[#38384a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#5c4ade] text-white flex items-center justify-center ink-border shadow-[1px_1px_0px_#000]">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Game Top-Up
                      </h4>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {condition.categories["game-topup"] ? "🔴 Sedang Maintenance" : "🟢 Buka Normal"}
                      </span>
                    </div>
                  </div>
                  <PopToggle
                    checked={condition.categories["game-topup"]}
                    onChange={(checked) =>
                      setCondition((prev) => ({
                        ...prev,
                        categories: { ...prev.categories, "game-topup": checked },
                      }))
                    }
                    activeColor="bg-amber-500"
                    label="Toggle Game Top-Up"
                  />
                </div>

                {/* 2. Akun Premium */}
                <div
                  className={`p-4 rounded-2xl ink-border transition-all flex items-center justify-between ${
                    condition.categories["akun-premium"]
                      ? "bg-amber-50 dark:bg-[#201d18] border-amber-500 shadow-[2px_2px_0px_#f59e0b]"
                      : "bg-[#fbfbfd] dark:bg-[#1f1f2e] border-gray-300 dark:border-[#38384a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ec4899] text-white flex items-center justify-center ink-border shadow-[1px_1px_0px_#000]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Akun Premium
                      </h4>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {condition.categories["akun-premium"] ? "🔴 Sedang Maintenance" : "🟢 Buka Normal"}
                      </span>
                    </div>
                  </div>
                  <PopToggle
                    checked={condition.categories["akun-premium"]}
                    onChange={(checked) =>
                      setCondition((prev) => ({
                        ...prev,
                        categories: { ...prev.categories, "akun-premium": checked },
                      }))
                    }
                    activeColor="bg-amber-500"
                    label="Toggle Akun Premium"
                  />
                </div>

                {/* 3. Pulsa & E-Wallet */}
                <div
                  className={`p-4 rounded-2xl ink-border transition-all flex items-center justify-between ${
                    condition.categories["pulsa-ewallet"]
                      ? "bg-amber-50 dark:bg-[#201d18] border-amber-500 shadow-[2px_2px_0px_#f59e0b]"
                      : "bg-[#fbfbfd] dark:bg-[#1f1f2e] border-gray-300 dark:border-[#38384a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center ink-border shadow-[1px_1px_0px_#000]">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Pulsa & E-Wallet
                      </h4>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {condition.categories["pulsa-ewallet"] ? "🔴 Sedang Maintenance" : "🟢 Buka Normal"}
                      </span>
                    </div>
                  </div>
                  <PopToggle
                    checked={condition.categories["pulsa-ewallet"]}
                    onChange={(checked) =>
                      setCondition((prev) => ({
                        ...prev,
                        categories: { ...prev.categories, "pulsa-ewallet": checked },
                      }))
                    }
                    activeColor="bg-amber-500"
                    label="Toggle Pulsa & E-Wallet"
                  />
                </div>

                {/* 4. Voucher Digital */}
                <div
                  className={`p-4 rounded-2xl ink-border transition-all flex items-center justify-between ${
                    condition.categories["voucher-digital"]
                      ? "bg-amber-50 dark:bg-[#201d18] border-amber-500 shadow-[2px_2px_0px_#f59e0b]"
                      : "bg-[#fbfbfd] dark:bg-[#1f1f2e] border-gray-300 dark:border-[#38384a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#10b981] text-white flex items-center justify-center ink-border shadow-[1px_1px_0px_#000]">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                        Voucher Digital
                      </h4>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {condition.categories["voucher-digital"] ? "🔴 Sedang Maintenance" : "🟢 Buka Normal"}
                      </span>
                    </div>
                  </div>
                  <PopToggle
                    checked={condition.categories["voucher-digital"]}
                    onChange={(checked) =>
                      setCondition((prev) => ({
                        ...prev,
                        categories: { ...prev.categories, "voucher-digital": checked },
                      }))
                    }
                    activeColor="bg-amber-500"
                    label="Toggle Voucher Digital"
                  />
                </div>
              </div>

              {/* Quick Actions Buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCondition((prev) => ({
                      ...prev,
                      categories: {
                        "game-topup": true,
                        "akun-premium": true,
                        "pulsa-ewallet": true,
                        "voucher-digital": true,
                      },
                    }))
                  }
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl ink-border text-[11px] font-black uppercase cursor-pointer"
                >
                  Tutup Semua Kategori (Maintenance)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCondition((prev) => ({
                      ...prev,
                      categories: {
                        "game-topup": false,
                        "akun-premium": false,
                        "pulsa-ewallet": false,
                        "voucher-digital": false,
                      },
                    }))
                  }
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl ink-border text-[11px] font-black uppercase cursor-pointer"
                >
                  Buka Semua Kategori (Normal Live)
                </button>
              </div>
            </section>

            {/* SEKSI 2: PRESET TEMA & ALASAN PEMELIHARAAN */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#55db9c] text-black rounded-lg ink-border">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    2. Pilih Template / Jenis Pemeliharaan
                  </h2>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500">
                  Preset Cepat
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pilih jenis pemeliharaan untuk mengisi pesan, judul, dan badge secara otomatis sesuai situasi:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(PRESET_OPTIONS) as MaintenancePreset[]).map((key) => {
                  const opt = PRESET_OPTIONS[key];
                  const isSelected = condition.preset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPreset(key)}
                      className={`p-3 text-left rounded-2xl ink-border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_#000] font-black scale-[1.01]"
                          : "bg-[#fbfbfd] dark:bg-[#1f1f2e] text-carbon dark:text-white hover:bg-gray-100 dark:hover:bg-[#28283a]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase">{opt.name}</span>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] opacity-80 mt-1 line-clamp-1">
                        {opt.estimatedTime}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SEKSI 3: KUSTOMISASI TEKS & ESTIMASI WAKTU */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#5c4ade] text-white rounded-lg ink-border">
                    <Clock className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    3. Kustomisasi Teks Pop-up
                  </h2>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500">
                  Dapat Diubah Bebas
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block mb-1">
                    Teks Badge (Label Kecil):
                  </label>
                  <input
                    type="text"
                    value={condition.badge}
                    onChange={(e) =>
                      setCondition((prev) => ({ ...prev, badge: e.target.value, preset: "CUSTOM" }))
                    }
                    placeholder="PEMELIHARAAN SISTEM • MAINTENANCE"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block mb-1">
                    Judul Utama Pop-up:
                  </label>
                  <input
                    type="text"
                    value={condition.title}
                    onChange={(e) =>
                      setCondition((prev) => ({ ...prev, title: e.target.value, preset: "CUSTOM" }))
                    }
                    placeholder="Sedang Dalam Pemeliharaan / Perbaikan"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block mb-1">
                    Pesan Deskripsi (Keterangan):
                  </label>
                  <textarea
                    rows={3}
                    value={condition.description}
                    onChange={(e) =>
                      setCondition((prev) => ({
                        ...prev,
                        description: e.target.value,
                        preset: "CUSTOM",
                      }))
                    }
                    placeholder="Tuliskan alasan pemeliharaan untuk pembeli..."
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-medium text-carbon dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block mb-1">
                    Estimasi Selesai / Buka Kembali:
                  </label>
                  <input
                    type="text"
                    value={condition.estimatedTime}
                    onChange={(e) =>
                      setCondition((prev) => ({
                        ...prev,
                        estimatedTime: e.target.value,
                        preset: "CUSTOM",
                      }))
                    }
                    placeholder="Contoh: Estimasi Buka: Segera (Coming Soon) atau Pukul 21:00 WIB"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#55db9c] hover:bg-[#43cd8c] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
                </button>
              </div>
            </section>
          </div>

          {/* Sisi Kanan: Interactive Live Preview (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] sticky top-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#ec4899] text-white rounded-lg ink-border">
                    <Eye className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    Pratinjau Langsung (Live Preview)
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 ink-border">
                  Real-time
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ini adalah tampilan persis modal pop-up yang akan dilihat pembeli ketika mengklik tombol bayar di HP / Laptop:
              </p>

              {/* Modal Card Mockup */}
              <div className="p-4 sm:p-5 bg-gray-900/90 rounded-2xl ink-border flex items-center justify-center">
                <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-5 max-w-sm w-full relative shadow-[4px_4px_0px_0px_#ffd731]">
                  {/* Close button mock */}
                  <div className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gray-100 dark:bg-[#252538] flex items-center justify-center text-carbon dark:text-gray-300">
                    <X className="w-4 h-4" />
                  </div>

                  {/* Header Maskot */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/40 p-1 flex-shrink-0 flex items-center justify-center">
                      <img
                        src="/brand/padxy-mascot.png"
                        alt="Padxy Mascot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>{condition.badge || "PEMELIHARAAN SISTEM"}</span>
                      </div>
                      <h3 className="font-[var(--font-bricolage)] text-base font-black text-carbon dark:text-white uppercase leading-tight mt-0.5">
                        {condition.title || "Sedang Dalam Pemeliharaan"}
                      </h3>
                    </div>
                  </div>

                  {/* Pesan */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-3">
                    {condition.description || "Halo Gamers! Layanan sedang dalam pemeliharaan berkala..."}
                  </p>

                  {/* Estimasi */}
                  {condition.estimatedTime && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-[#26201a] border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-3">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{condition.estimatedTime}</span>
                    </div>
                  )}

                  {/* Mini Order Summary Sample */}
                  <div className="bg-gray-50 dark:bg-[#20202e] rounded-xl p-2.5 border border-gray-200 dark:border-[#2f2f42] text-[11px] font-bold text-carbon dark:text-gray-200 mb-4 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="block truncate text-gray-800 dark:text-white">
                        Mobile Legends / Alight Motion
                      </span>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold block truncate">
                        86 Diamonds / 1 Tahun
                      </span>
                    </div>
                    <span className="text-xs font-black text-green-700 dark:text-green-400 flex-shrink-0">
                      Rp 21.000
                    </span>
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 bg-carbon text-white dark:bg-[#ffd731] dark:text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Oke, Mengerti</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-[#dceeff] dark:bg-[#152338] ink-border dark:border-[#2d3f5e] rounded-2xl text-xs font-semibold text-[#003a6b] dark:text-[#bae6fd]">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <HelpCircle className="w-4 h-4" />
                  Tips Admin:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Jika saldo Digiflazz belum diisi, biarkan Game Top-Up dan Pulsa dalam status Maintenance. Pengunjung tetap dapat mengecek harga, mengecek User ID game, dan menjelajahi promo. Begitu saldo sudah siap, Anda cukup klik 1 tombol toggle di atas untuk membuka transaksi secara instan!
                </p>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
