# Task Plan: Implementasi Paket Fitur Pertumbuhan XYZPEDIA

**Goal**: Mengimplementasikan seluruh paket fitur strategis e-commerce game top-up & akun digital (Banner Dinamis, Review Pembeli, Live Ticker Transaksi, Export Laporan Keuangan, Proteksi Margin Supplier, dan WhatsApp Gateway Notification).

## Status Tracker
- [x] **Fase 1: Schema & Database Architecture**
  - [x] Tambahkan model `Banner` dan `Review` di `prisma/schema.prisma`
  - [x] Jalankan `npx prisma db push` ke Neon PostgreSQL
  - [x] Seed banner & sample review awal yang realistis

- [x] **Fase 2: Banner Promo Dinamis (Admin & Storefront)**
  - [x] Endpoint API `/api/admin/banners` (GET, POST, PATCH, DELETE) & `/api/banners`
  - [x] Halaman Admin `/admin/banner` dengan antarmuka Neo-Brutalist Stitch UI
  - [x] Dynamic Hero Carousel di `src/app/page.tsx` & `src/components/PromoBannerCarousel.tsx`

- [x] **Fase 3: Rating & Testimoni Pembeli Asli**
  - [x] Endpoint API `/api/reviews` (POST submit dari struk, GET ulasan terverifikasi)
  - [x] Form ulasan bintang 1-5 di `src/app/struk/[invoiceNumber]/StrukClient.tsx`
  - [x] Komponen showcase review di `src/app/produk/[slug]/page.tsx`

- [x] **Fase 4: Live Ticker Transaksi Terkini**
  - [x] Endpoint `/api/recent-orders` (mengambil order sukses dengan masking nama & lokasi acak)
  - [x] Floating Neo-Brutalist Toast Ticker di pojok kiri bawah (`RecentOrdersTicker.tsx` di `layout.tsx`)

- [x] **Fase 5: Export Laporan Keuangan (Excel / CSV)**
  - [x] Endpoint `/api/admin/orders/export` (filter tanggal & status, BOM UTF-8, kolom margin profit & modal)
  - [x] Tombol Download Laporan Keuangan di `/admin/transaksi` dengan fallback client-side

- [x] **Fase 6: Proteksi Margin Harga Otomatis & Auto-Sync Supplier**
  - [x] Aturan proteksi profit margin di `src/lib/digiflazzSync.ts` (minimal margin Rp 500)
  - [x] Auto-margin protection di `src/app/api/admin/products/sync-prices/route.ts`

- [x] **Fase 7: WhatsApp Gateway Notification Engine**
  - [x] Modul universal `src/lib/whatsapp.ts` (dukungan Fonnte / generic WhatsApp webhook)
  - [x] Dispatch notifikasi otomatis saat pesanan sukses di `src/lib/orderFulfillment.ts`

- [x] **Fase 8: Verifikasi & Deployment Ready**
  - [x] Unit testing (`36/36 tests passed`) & TypeScript typecheck (`tsc --noEmit` clean 0 error)
  - [ ] Konfirmasi push ke GitHub & Vercel deployment oleh user
