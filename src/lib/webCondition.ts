import { prisma } from "@/lib/prisma";

export type MaintenancePreset =
  | "SCHEDULED"
  | "RESTOCK"
  | "EMERGENCY"
  | "EVENT"
  | "CUSTOM";

export interface WebConditionSettings {
  fullSiteLock: boolean;
  fullSiteMessage?: string;
  paymentMaintenance: boolean;
  categories: {
    "game-topup": boolean;
    "akun-premium": boolean;
    "pulsa-ewallet": boolean;
    "voucher-digital": boolean;
  };
  preset: MaintenancePreset;
  title: string;
  badge: string;
  description: string;
  secondaryText: string;
  estimatedTime: string;
  showPriceAndItem: boolean;
  allowCatalogBrowsing: boolean;
}

export const PRESET_OPTIONS: Record<
  MaintenancePreset,
  {
    name: string;
    title: string;
    badge: string;
    description: string;
    secondaryText: string;
    estimatedTime: string;
  }
> = {
  SCHEDULED: {
    name: "Pemeliharaan Berkala (Rutin)",
    title: "Sedang Dalam Pemeliharaan / Perbaikan",
    badge: "PEMELIHARAAN SISTEM • MAINTENANCE",
    description:
      "Halo Gamers! 🚀 Layanan pembelian sedang dalam tahap pemeliharaan & sinkronisasi berkala. Pembelian akan segera dibuka kembali dalam waktu dekat!",
    secondaryText:
      "Layanan transaksi untuk kategori ini akan segera dibuka kembali. Anda tetap dapat menjelajahi seluruh katalog, harga promo, dan fitur pengecekan User ID.",
    estimatedTime: "Estimasi Buka: Segera (Coming Soon)",
  },
  RESTOCK: {
    name: "Pengisian Saldo & Kuota Provider",
    title: "Pengisian Saldo Provider Sedang Berlangsung",
    badge: "RESTOCK SALDO • PENDING FULFILLMENT",
    description:
      "Halo Pelanggan Setia! 💳 Gateway dan kuota server pusat sedang dalam proses top-up & sinkronisasi saldo otomatis agar transaksi Anda lancar tanpa kendala.",
    secondaryText:
      "Sistem transaksi akan otomatis dibuka segera setelah kuota saldo gateway terverifikasi.",
    estimatedTime: "Estimasi Buka: ~1 - 2 Jam Lagi",
  },
  EMERGENCY: {
    name: "Perbaikan Gangguan Gateway / Server",
    title: "Optimalisasi Jalur Koneksi Gateway",
    badge: "PERBAIKAN DARURAT • GATEWAY TUNING",
    description:
      "Mohon maaf atas ketidaknyamanannya! 🛠️ Tim teknis kami sedang mengoptimalkan rute koneksi pembayaran QRIS dinamis untuk kecepatan respon terbaik.",
    secondaryText:
      "Data akun dan saldo Anda 100% aman. Transaksi akan segera aktif kembali.",
    estimatedTime: "Estimasi Buka: Dalam Waktu Singkat",
  },
  EVENT: {
    name: "Persiapan Event / Fitur Baru",
    title: "Persiapan Rilis Fitur & Promo Spesial",
    badge: "UPDATE BESAR • NEW FEATURES SOON",
    description:
      "Sesuatu yang seru sedang disiapkan! 🎉 Kami sedang memasang sistem katalog baru dan diskon promo ekstra untuk Anda.",
    secondaryText:
      "Pantau terus katalog kami untuk menikmati harga terbaik setelah pembaruan selesai.",
    estimatedTime: "Estimasi Buka: Segera Hari Ini",
  },
  CUSTOM: {
    name: "Kustom Sendiri (Bebas Atur Teks)",
    title: "Sistem Sedang Dalam Penyesuaian",
    badge: "STATUS KHUSUS • ADMIN MODE",
    description:
      "Layanan saat ini sedang disesuaikan oleh administrator toko.",
    secondaryText:
      "Silakan coba beberapa saat lagi.",
    estimatedTime: "Estimasi: Segera",
  },
};

export const DEFAULT_WEB_CONDITION: WebConditionSettings = {
  fullSiteLock: false,
  paymentMaintenance: false,
  categories: {
    "game-topup": true,
    "akun-premium": true, // Sesuai instruksi user: akun premium juga maintenance!
    "pulsa-ewallet": true,
    "voucher-digital": true,
  },
  preset: "SCHEDULED",
  title: PRESET_OPTIONS.SCHEDULED.title,
  badge: PRESET_OPTIONS.SCHEDULED.badge,
  description: PRESET_OPTIONS.SCHEDULED.description,
  secondaryText: PRESET_OPTIONS.SCHEDULED.secondaryText,
  estimatedTime: PRESET_OPTIONS.SCHEDULED.estimatedTime,
  showPriceAndItem: true,
  allowCatalogBrowsing: true,
};

const SETTING_KEY = "web_condition";

/**
 * Mengambil konfigurasi kondisi web dari database (fallback ke DEFAULT_WEB_CONDITION)
 */
export async function getWebCondition(): Promise<WebConditionSettings> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (!record || !record.value) {
      return DEFAULT_WEB_CONDITION;
    }

    const parsed = JSON.parse(record.value);
    return {
      ...DEFAULT_WEB_CONDITION,
      ...parsed,
      categories: {
        ...DEFAULT_WEB_CONDITION.categories,
        ...(parsed.categories || {}),
      },
    };
  } catch (err) {
    console.error("[getWebCondition] Gagal membaca dari database:", err);
    return DEFAULT_WEB_CONDITION;
  }
}

/**
 * Menyimpan konfigurasi kondisi web ke database
 */
export async function saveWebCondition(
  updates: Partial<WebConditionSettings>
): Promise<WebConditionSettings> {
  const current = await getWebCondition();
  const merged: WebConditionSettings = {
    ...current,
    ...updates,
    categories: {
      ...current.categories,
      ...(updates.categories || {}),
    },
  };

  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    create: {
      key: SETTING_KEY,
      value: JSON.stringify(merged),
    },
    update: {
      value: JSON.stringify(merged),
    },
  });

  return merged;
}

/**
 * Cek apakah produk / kategori sedang dalam mode pemeliharaan
 */
export function checkIsCategoryUnderMaintenance(
  condition: WebConditionSettings,
  categorySlug?: string | null
): boolean {
  if (condition.fullSiteLock || condition.paymentMaintenance) {
    return true;
  }

  if (!categorySlug) {
    return true;
  }

  const categoryKey = categorySlug as keyof WebConditionSettings["categories"];
  if (categoryKey in condition.categories) {
    return Boolean(condition.categories[categoryKey]);
  }

  return true;
}
