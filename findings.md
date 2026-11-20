# Domain Knowledge & Findings Log: XYZPEDIA

## 1. Arsitektur & Lingkungan
- **Framework:** Next.js 16 (Turbopack) dengan React 19.
- **Database:** Neon Serverless PostgreSQL (`prisma/schema.prisma`).
- **Styling:** Tailwind CSS v4, Neo-Brutalist Stitch UI (`ink-border`, `shadow-[3px_3px_0px_#000000]`, font Bricolage Grotesque).
- **Payment Gateway:** QiosPay (QRIS Realtime, webhook di `/api/webhooks/qiospay`).
- **Suppliers:**
  - Digiflazz (H2H Game top-up via buyer SKU & customerNo).
  - Waroengkuy (Akun Digital via `POST /orders`, PPOB via `POST /ppob/orders`).

## 2. Invarian Keamanan & Privasi
- Catatan supplier (`notes`) berisi saldo admin dan detail API tidak boleh dibocorkan ke client/struk.
- Masking PII: email pembeli (`ra***9@gmail.com`) dan nomor HP (`0812****789`).
- Penghapusan produk permanen harus menggunakan transaksi cascade (`order.deleteMany`, `productItem.deleteMany`, `product.delete`).
- Produk berstatus `isActive: false` (OFFLINE) disaring dari Storefront, Katalog, Fuse.js Search, sitemap, dan mengembalikan `notFound()` pada URL langsung.

## 3. Aturan Desain Anti-Slop
- Teks deskripsi dan instruksi harus berbahasa Indonesia khas industri top up game (bukan terjemahan robot).
- Warna aksen: `#ffd731` (Kuning Pop), `#55db9c` (Mint Hijau), `#38bdf8` (Biru Langit), `#ffdad6` (Merah Pudar).
