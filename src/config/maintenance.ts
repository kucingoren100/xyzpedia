/**
 * Konfigurasi Status Sistem Pembayaran XYZPEDIA
 * 
 * - Ubah menjadi true saat ingin menampilkan popup "Server Sedang Maintenance" saat user klik Bayar.
 * - Ubah menjadi false saat toko sudah siap menerima pembayaran riil.
 */
export const IS_PAYMENT_MAINTENANCE: boolean =
  process.env.NEXT_PUBLIC_PAYMENT_MAINTENANCE !== "false";

export const MAINTENANCE_CONFIG = {
  title: "Sistem Pembayaran Sedang Pemeliharaan",
  badge: "PEMELIHARAAN SISTEM • MAINTENANCE",
  description:
    "Halo Gamers! 🚀 Terima kasih banyak atas antusiasme Anda di XYZPEDIA. Saat ini gerbang pembayaran dan sinkronisasi server resmi kami sedang dalam tahap pemeliharaan berkala (maintenance).",
  secondaryText:
    "Layanan transaksi pembelian akan segera dibuka kembali dalam waktu dekat. Anda tetap dapat menjelajahi seluruh katalog, harga promo, dan fitur pengecekan User ID.",
  statusText: "Estimasi Buka: Segera (Coming Soon)",
};
