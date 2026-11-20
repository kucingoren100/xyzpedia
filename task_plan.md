# Task Plan: 5 Fitur Strategis Baru XYZPEDIA

**Goal**: Mengimplementasikan 5 fitur strategis untuk XYZPEDIA (`https://xyzpedia.my.id`):
1. Pop-up Konfirmasi Nickname Game Otomatis (Pre-checkout validation modal)
2. Sitemap XML Dinamis & Auto Google Indexing (SEO, sitemap, robots, schema.org JSON-LD)
3. Banner Peringatan Anti-Penipuan (Security Trust Badges & Fraud Alert)
4. Fitur Pengajuan Garansi / Komplain Terstruktur (Ticket System untuk customer struk & dashboard admin)
5. Flash Sale Real-Time dengan Kuota Terbatas (Countdown, quota progress bar, deal cards)

## Status Tracker
- [x] **Fase 1: Database Schema & Push**
  - [x] Tambahkan model `WarrantyClaim` di `prisma/schema.prisma`
  - [x] Jalankan `npx prisma db push` ke Neon PostgreSQL
  - [x] Generate Prisma client dengan sukses

- [x] **Fase 2: Pop-up Konfirmasi Nickname Game Otomatis**
  - [x] Perbarui `ProductCustomizerClient.tsx` untuk menampilkan Neo-Brutalist Modal Konfirmasi sebelum checkout
  - [x] Tampilkan Nickname (terverifikasi / status), User ID, Server/Zone, Item dipilih, dan Total Bayar
  - [x] Berikan tombol "Konfirmasi & Lanjutkan Bayar" dan "Ubah Data"
  - [x] Tangani fallback ketika verifikasi nickname gagal/unverified dengan pesan peringatan jelas

- [x] **Fase 3: Sitemap XML Dinamis & Auto Google Indexing**
  - [x] Perbarui `src/app/sitemap.ts` dengan domain `https://xyzpedia.my.id`, semua rute statis, kategori dinamis, dan produk dinamis
  - [x] Perbarui `src/app/robots.ts` mengarah ke `https://xyzpedia.my.id/sitemap.xml`
  - [x] Tambahkan Schema.org JSON-LD (`Organization` & `WebSite` with SearchAction) di `src/app/layout.tsx`
  - [x] Tambahkan Schema.org JSON-LD (`Product` & `Offer`) di `src/app/produk/[slug]/page.tsx`

- [x] **Fase 4: Banner Peringatan Anti-Penipuan (Security Trust Badge)**
  - [x] Buat komponen `src/components/SecurityTrustBanner.tsx` dengan gaya Neo-Brutalist Stitch UI
  - [x] Tampilkan peringatan anti-fraud resmi, proteksi garansi 100%, dan badge CS WhatsApp resmi
  - [x] Pasang di `src/app/page.tsx` dan `src/components/ProductCustomizerClient.tsx`

- [x] **Fase 5: Fitur Pengajuan Garansi / Komplain Terstruktur (Ticket System)**
  - [x] Buat API `/api/warranty-claims` (POST customer pengajuan dari struk, GET status klaim)
  - [x] Buat API `/api/admin/warranty-claims` (GET all, PATCH update status & admin notes)
  - [x] Tambahkan form klaim garansi & status tracker interaktif di `src/app/struk/[invoiceNumber]/StrukClient.tsx` (`WarrantyClaimWidget.tsx`)
  - [x] Buat halaman admin `/admin/garansi` (`src/app/admin/garansi/page.tsx` & `src/components/admin/AdminGaransiClient.tsx`)
  - [x] Tambahkan menu "Klaim Garansi" ke `src/components/admin/AdminSidebar.tsx`
  - [x] Tambahkan audit log event untuk pengelolaan garansi

- [x] **Fase 6: Flash Sale Real-Time dengan Kuota Terbatas**
  - [x] Buat komponen `src/components/FlashSaleSection.tsx` dengan live countdown timer, quota progress bar ("Tersisa 3/10 slot"), kartu produk diskon
  - [x] Integrasikan ke `src/app/page.tsx` dan hubungkan dengan `FlashSaleBanner.tsx`

- [x] **Fase 7: Testing, Typecheck & Verifikasi**
  - [x] Jalankan `npx vitest run` (38/38 tests passed)
  - [x] Jalankan `npx tsc --noEmit` (0 error)
  - [ ] Konfirmasi git commit & persetujuan user sebelum git push
