/**
 * Konfigurasi Status Sistem Pembayaran XYZPEDIA
 * 
 * - Default: false (Sistem pembayaran QiosPay aktif untuk menerima pembayaran)
 * - Ubah menjadi true jika sewaktu-waktu ingin mengaktifkan popup maintenance
 */
export const IS_PAYMENT_MAINTENANCE: boolean =
  process.env.NEXT_PUBLIC_PAYMENT_MAINTENANCE === "true";

export const MAINTENANCE_CONFIG = {
  title: "Sistem Pembayaran Sedang Pemeliharaan",
  badge: "PEMELIHARAAN SISTEM • MAINTENANCE",
  description:
    "Halo Gamers! 🚀 Gateway pembayaran sedang dalam pemeliharaan berkala untuk persiapan rilis penuh. Pembelian akan segera dibuka kembali dalam waktu dekat!",
  secondaryText:
    "Layanan transaksi pembelian akan segera dibuka kembali dalam waktu dekat. Anda tetap dapat menjelajahi seluruh katalog, harga promo, dan fitur pengecekan User ID.",
  statusText: "Estimasi Buka: Segera (Coming Soon)",
};
