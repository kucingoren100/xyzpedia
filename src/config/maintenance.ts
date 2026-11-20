/**
 * Konfigurasi Status Pemeliharaan Sistem Pembayaran XYZPEDIA
 * Didukung penuh oleh dynamic database configuration (src/lib/webCondition.ts)
 */

export const IS_PAYMENT_MAINTENANCE: boolean =
  process.env.NEXT_PUBLIC_PAYMENT_MAINTENANCE === "true";

export const MAINTENANCE_CONFIG = {
  title: "Sedang Dalam Pemeliharaan / Perbaikan",
  badge: "PEMELIHARAAN SISTEM • MAINTENANCE",
  description:
    "Halo Gamers! 🚀 Layanan pembelian untuk produk ini sedang dalam tahap pemeliharaan / perbaikan berkala. Pembelian akan segera dibuka kembali dalam waktu dekat!",
  secondaryText:
    "Layanan transaksi untuk kategori produk ini akan segera dibuka kembali. Anda tetap dapat menjelajahi seluruh katalog, harga promo, dan fitur pengecekan User ID.",
  statusText: "Estimasi Buka: Segera (Coming Soon)",
};
