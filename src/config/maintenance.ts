/**
 * Konfigurasi Status Pemeliharaan Sistem Pembayaran XYZPEDIA
 * 
 * - Produk kategori "akun-premium" (Alight Motion, Canva, Netflix, ChatGPT, dll.) AKTIF & BISA DIBELI via QiosPay.
 * - Produk selain kategori "akun-premium" (Game Top Up, Pulsa, E-Wallet, Voucher Digital) SEDANG DALAM PEMELIHARAAN / PERBAIKAN.
 */

export const isProductInMaintenance = (categorySlug?: string | null): boolean => {
  // Jika global maintenance diaktifkan via environment variable
  if (process.env.NEXT_PUBLIC_PAYMENT_MAINTENANCE === "true") {
    return true;
  }
  // Hanya kategori "akun-premium" yang aktif / bisa dibeli
  if (categorySlug === "akun-premium") {
    return false;
  }
  // Semua produk selain akun premium (game-topup, pulsa-ewallet, voucher-digital) masuk mode pemeliharaan
  return true;
};

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
