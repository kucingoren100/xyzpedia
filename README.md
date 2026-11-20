# XYZPEDIA - Digital Voucher & Game Top-Up Platform

XYZPEDIA adalah platform e-commerce web modern untuk top-up game instan, voucher digital, dan layanan premium terotomasi yang dibangun dengan Next.js App Router, Prisma ORM, dan PostgreSQL (Neon Serverless).

---

## 🚀 Fitur Utama & Keamanan

- **State Machine Pesanan yang Kuat**: Status transisi pesanan terkunci ketat (`PENDING` → `PAID` → `PROCESSING` → `SUCCESS` / `FAILED` / `REFUNDED`) untuk mencegah race condition, double fulfillment, atau manipulasi callback.
- **Klaim Atomik & Idempotensi**: Eksekusi fulfillment dilindungi oleh kunci atomik berbasis status database (`markOrderPaid`), memastikan supplier API hanya dipanggil satu kali per pesanan.
- **Enkripsi Kredensial Sensitif**: Token notifikasi Telegram dan WhatsApp disimpan terenkripsi di database menggunakan AES-256-GCM (`SYSTEM_NOTIFICATION_AES_KEY`). API Admin menyamarkan rahasia menjadi format ter-masking (`••••••••XXXX`).
- **Autentikasi Admin Terproteksi**:
  - Hash password standar industri `scrypt` dengan deteksi dan auto-upgrade otomatis dari legacy SHA-256.
  - Sesi HMAC-SHA256 bertanda tangan dengan dukungan revokasi instan melalui database (`AdminSession`).
  - Pencegahan timing attack menggunakan `crypto.timingSafeEqual`.
  - Rate limiting berbasis IP cerdas (proxy-aware via `TRUSTED_PROXY`).
- **Validasi Kupon Terpusat**: Perhitungan diskon divalidasi ketat di sisi server dengan perlindungan harga modal supplier (`supplierPrice`) agar margin keuntungan tetap aman dari kerugian.
- **Privasi Pesanan Publik**: Pencarian pesanan publik dibatasi pada format invoice spesifik (`INV-XYZ-...`), mencegah enumerasi data pengguna atau kebocoran email. Fitur riwayat email dilindungi alur magic link berbasis waktu (HMAC token 30 menit).
- **Upload File Aman**: Validasi MIME type berbasis magic bytes (sniffing buffer biner untuk JPEG, PNG, WEBP, GIF), penolakan SVG berpotensi XSS, dan abstraksi storage Vercel Blob.
- **Content Security Policy (CSP)**: Header keamanan terpasang dengan mode Report-Only untuk pemantauan pelanggaran skrip tanpa mengganggu aset pihak ketiga.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend & Fullstack Framework**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons, Framer Motion
- **Database & ORM**: PostgreSQL (Neon Database Serverless), Prisma ORM
- **Fulfillment API**: Digiflazz H2H API
- **Payment Gateway**: Pakasir Gateway (QRIS, E-Wallet, Virtual Account)
- **Notifikasi**: Telegram Bot API, WhatsApp Gateway API
- **Testing & Tooling**: Vitest, TypeScript, GitHub Actions CI

---

## 🔄 Alur Transaksi & Pemenuhan (Fulfillment Workflow)

```
[Pengguna] Melakukan Checkout Produk
     │
     ▼
[Server Action: createOrder]
     │ Validasi kupon terhadap harga modal
     │ Buat invoice PENDING & panggil Payment Gateway
     ▼
[Pengguna Melakukan Pembayaran QRIS / VA]
     │
     ▼
[Webhook Pembayaran / Polling Status]
     │
     ▼
[markOrderPaid: Klaim Atomik Status]
     │ Ubah status dari PENDING ke PAID
     │ Kunci baris agar tidak dieksekusi paralel
     ▼
[Fulfillment: Digiflazz / Manual]
     ├─ Jika Sukses ──► Status: SUCCESS (Kirim WhatsApp/Telegram)
     ├─ Jika Gagal  ──► Status: FAILED
     └─ Jika Pending ─► Cron Reconcile (/api/cron/reconcile) memverifikasi ulang
```

---

## 💻 Panduan Menjalankan Secara Lokal (Local Development)

### 1. Persyaratan Sistem
- Node.js versi 20.x atau 22.x
- npm versi 10.x+
- Akun PostgreSQL (Neon Serverless atau PostgreSQL lokal)

### 2. Kloning & Instalasi Dependensi
```bash
git clone https://github.com/username/xyzpedia.git
cd xyzpedia
npm install --legacy-peer-deps
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin berkas template lingkungan:
```bash
cp .env.example .env
```
Lengkapi variabel lingkungan sesuai instruksi di dalam `.env.example`:
- Database (`DATABASE_URL`, `DIRECT_URL`)
- Admin Kredensial (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`)
- Kunci Enkripsi (`SYSTEM_NOTIFICATION_AES_KEY` - 64 karakter hex)
- Integrasi Digiflazz & Pakasir

### 4. Sinkronisasi Database
```bash
npx prisma generate
# Untuk development lokal:
npx prisma db push
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian & Verifikasi Kualitas Kode

Proyek ini dilengkapi dengan suite pengujian otomatis Vitest untuk memastikan keandalan alur bisnis kritis:

```bash
# 1. Jalankan pemeriksaan tipe TypeScript
npx tsc --noEmit

# 2. Jalankan unit test (State Machine, Auth Guard, Kupon, Helper)
npx vitest run

# 3. Jalankan pengujian build produksi
npm run build

# 4. Audit keamanan dependensi
npm audit
```

---

## 🌐 Deployment (Vercel)

1. Hubungkan repository GitHub ke dashboard [Vercel](https://vercel.com).
2. Konfigurasikan semua Environment Variables yang terdaftar di `.env.example` pada pengaturan proyek Vercel.
3. Pengaturan Cron Job untuk rekonsiliasi pesanan otomatis telah didefinisikan di `vercel.json` dan akan aktif otomatis pada endpoint `/api/cron/reconcile`.
4. Deploy aplikasi (`git push origin main` setelah verifikasi selesai).

---

## 📄 Lisensi
Hak Cipta © XYZPEDIA. Seluruh hak cipta dilindungi undang-undang.
