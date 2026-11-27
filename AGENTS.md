<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aturan kerja agent untuk XYZPEDIA

Toko top-up game dan produk digital: Next.js 16, Prisma + PostgreSQL (Neon), deploy di Vercel, pembayaran QRIS via QiosPay, supplier Digiflazz dan Waroengkuy.

## Hemat token

- Cari dulu (grep atau pencarian nama file), baru baca. Baca rentang baris yang perlu, bukan file utuh.
- Jangan baca ulang file yang sudah dibaca dan belum berubah.
- Edit terarah (str_replace atau patch). Jangan menulis ulang file utuh.
- Potong output perintah panjang (`| head`, `| tail`). Jangan menempel log penuh.
- Jangan menjelajah `node_modules`, `.next`, atau `.git` kecuali memang perlu. Baca dokumentasi Next hanya untuk API yang dipakai.
- Kerjakan hanya tugas yang diminta. Jangan menambah fitur, refactor, atau file di luar tugas.
- Tanya satu kali di awal bila ada yang ambigu, lalu kerjakan sampai selesai tanpa berhenti di tiap langkah.
- Jalankan tes yang relevan dulu. `tsc`, lint, tes penuh, dan build cukup sekali sebelum commit.
- Laporan singkat: apa yang diubah, hasil verifikasi, yang belum selesai. Jangan mengulang isi tugas atau menempel diff.

## Aturan projek (jangan dilanggar)

### Keamanan dan data
- Semua route di `src/app/api/admin/**` wajib memanggil `getAdminSession()`, dan cek peran untuk aksi yang mengubah data.
- Jangan mengirim objek Prisma mentah ke client atau respons publik. Pilih field dengan `select`. `supplierPrice`, `sku`, `supplier`, `notes`, serta email dan nomor HP tanpa mask tidak boleh keluar ke publik.
- Jangan membuat data karangan yang ditampilkan seolah nyata: SN, kredensial, kode voucher, rating, jumlah ulasan, kota pembeli, status server, angka laporan.
- Jangan menghapus order atau catatan keuangan. Gunakan soft delete (`isActive=false`).
- Jangan mencetak, me-log, atau meng-commit secret. `.env`, `data/`, dan `*.db` tidak boleh ter-track.

### Pembayaran
- Status order hanya berubah lewat `canTransition` di `src/lib/orderStatus.ts`. Konfirmasi bayar lewat `markOrderPaid`, pengiriman ke supplier lewat `startFulfillment`.
- Setiap `fetch` ke luar (QiosPay, Digiflazz, Waroengkuy, dan lainnya) wajib timeout (`AbortSignal.timeout`). Pekerjaan setelah respons dikirim memakai `after()` atau `await`, bukan fire-and-forget.
- Webhook wajib memverifikasi signature (tolak jika header atau secret tidak ada), mencocokkan nominal persis, dan idempotent.

### Database
- Perubahan skema hanya aditif. Jangan menjalankan migrasi atau `db push` ke production; buat file migrasinya dan tulis perintahnya di laporan.
- Script yang menulis atau menghapus data wajib dry-run secara default dan menolak database remote tanpa flag eksplisit.
- Tes tidak boleh menyentuh database asli.

### Kode dan UI
- Input publik divalidasi dengan `zod` (harus terdeklarasi di `package.json`).
- Rate limit publik lewat helper bersama, bukan implementasi sendiri. IP klien lewat `getClientIp`.
- Teks UI tidak boleh memuat klaim yang tidak dijamin sistem ("100% aman", "instan 0.3s").

## Alur kerja

- Satu tugas, satu commit. Pesan commit menyebut ID tugas. Jangan `git push`.
- Sebelum commit: `npx tsc --noEmit`, `npm run lint`, `npx vitest run`.
