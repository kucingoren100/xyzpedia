import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/contact";
import {
  MessageCircle,
  Search,
  ShieldCheck,
  CreditCard,
  Truck,
  HelpCircle,
  RotateCcw,
  Zap,
  Phone,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function BantuanPage() {
  const faqCategories = [
    {
      category: "A. Pembayaran & QRIS Dinamis",
      icon: "payments",
      badgeColor: "bg-[#ffd731]",
      items: [
        {
          q: "Mengapa nominal transfer QRIS harus tepat sesuai kode unik?",
          a: "Sistem QiosPay menggunakan kode unik acak (contoh: transfer Rp 20.732) sebagai ID identifikasi pembayaran otomatis di mutasi perbankan. Jika dibayar pas tanpa kode unik atau dibulatkan, sistem tidak dapat mengenali pengirim secara otomatis sehingga pesanan tertunda.",
        },
        {
          q: "Aplikasi apa saja yang didukung untuk scan QRIS?",
          a: "QRIS XYZPEDIA adalah QRIS Standar Nasional (QRIS Dinamis). Anda dapat membayar menggunakan m-Banking apa pun (BCA Mobile, Livin by Mandiri, BRImo, BNI Mobile) dan seluruh E-Wallet resmi (GoPay, DANA, OVO, ShopeePay, LinkAja).",
        },
        {
          q: "Berapa lama batas waktu pembayaran QRIS?",
          a: "Batas waktu settlement adalah 15 menit sejak invoice dibuat. Jika melewati batas waktu, QRIS akan otomatis kedaluwarsa untuk menjaga keamanan harga dan ketersediaan stok.",
        },
      ],
    },
    {
      category: "B. Pengiriman & Akun Game",
      icon: "sports_esports",
      badgeColor: "bg-[#4da2ff]",
      items: [
        {
          q: "Berapa lama diamond atau item game masuk ke akun saya?",
          a: "Dalam kondisi normal, server otomatis kami menginjeksi item ke akun tujuan dalam rentang 1 - 3 detik setelah pembayaran terverifikasi. Anda tidak perlu login atau mengantri konfirmasi manual.",
        },
        {
          q: "Bagaimana jika salah memasukkan User ID atau Server ID?",
          a: "Pastikan Anda memeriksa kembali data akun sebelum membayar. Bila User ID terdaftar di server game, item akan terkirim ke akun tersebut dan tidak dapat ditarik kembali. Bila ID tidak valid, sistem akan menahan transaksi dan CS kami akan membantu proses perbaikan data.",
        },
        {
          q: "Apakah akun game saya aman dari ban?",
          a: "100% AMAN. Semua pengisian diamond dan game currency dilakukan melalui jalur resmi publisher API (Moonton, Garena, Riot Games, Hoyoverse). Bukan hasil cheat, carding, atau saldo ilegal.",
        },
      ],
    },
    {
      category: "C. Akun Premium & Kebijakan Garansi",
      icon: "tv",
      badgeColor: "bg-[#e9ccff]",
      items: [
        {
          q: "Bagaimana cara menerima akun atau link invite Spotify & Netflix?",
          a: "Detail akun (email, password profil, dan PIN) atau tautan undangan Family akan langsung tampil di layar konfirmasi transaksi Anda seketika setelah pembayaran sukses, serta dikirimkan salinannya ke alamat email yang Anda masukkan.",
        },
        {
          q: "Bagaimana klaim garansi jika akun streaming bermasalah?",
          a: "Semua akun premium di XYZPEDIA dilindungi garansi 100% full replacement selama masa aktif paket langganan. Jika terjadi kendala login atau reset profil, cukup hubungi CS WhatsApp kami dengan menyertakan Nomor Invoice untuk pergantian instan.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-12">
      {/* 1. HERO SECTION (Stitch Sky Wash Ground with physical vinyl badges) */}
      <section className="bg-[#dceeff] dark:bg-[#151926] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
        {/* Tilted Floating Mascot & Badge */}
        <div className="absolute right-6 top-6 hidden lg:flex items-center gap-3 pointer-events-none">
          <div className="w-24 h-24 object-contain drop-shadow-[3px_3px_0px_#000]">
            <img
              src="/brand/stiker/xyzi-stiker-halo.png"
              alt="XYZI Halo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="bg-[#ffd731] ink-border rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000000] rotate-[3deg]">
            24/7 AUTOMATED BOT + HUMAN CONCIERGE
          </div>
        </div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#20202e] dark:border-[#38384a] text-carbon dark:text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>PUSAT BANTUAN & FAQ MANDIRI</span>
          </div>

          <h1 className="font-[var(--font-bricolage)] text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase leading-[0.92] tracking-tight text-carbon dark:text-white">
            Ada yang Bisa Kami Bantu?
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl">
            Temukan panduan lengkap seputar pembayaran QRIS dinamis, status pesanan real-time, klaim garansi 100%, dan kontak customer care kami.
          </p>
        </div>
      </section>

      {/* 2. 3 QUICK CONTACT CHANNELS (Stitch Bento Cards) */}
      <section className="space-y-4">
        <div>
          <h2 className="font-[var(--font-bricolage)] text-2xl font-black text-carbon dark:text-white uppercase">
            Saluran Bantuan Tercepat
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
            Pilih metode kontak mandiri atau hubungi tim customer concierge kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Channel 1: WhatsApp Concierge */}
          <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-2xl p-6 flex flex-col justify-between relative shadow-[3px_3px_0px_0px_#000000] hover:scale-[1.01] transition-transform">
            <span className="absolute -top-3 right-6 bg-[#55db9c] ink-border rounded-full px-3 py-0.5 text-[10px] font-black uppercase text-black rotate-2">
              PRIORITAS UTAMA
            </span>
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#55db9c] ink-border flex items-center justify-center p-1 shadow-[2px_2px_0px_#000]">
                <img
                  src="/brand/stiker/xyzi-stiker-oke.png"
                  alt="XYZI CS"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-[var(--font-bricolage)] text-lg font-black text-carbon dark:text-white uppercase">
                WhatsApp Live Concierge
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold leading-relaxed">
                Terhubung langsung dengan tim Customer Care untuk bantuan kendala transaksi, verifikasi manual, dan tanya jawab umum.
              </p>
            </div>
            <a
              href={getWhatsAppUrl("Halo Admin XYZPEDIA, saya butuh bantuan")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full py-2.5 bg-black text-white hover:bg-[#55db9c] hover:text-black ink-border rounded-full text-xs font-black uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Hubungi WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Channel 2: Track Order Online */}
          <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-2xl p-6 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000000] hover:scale-[1.01] transition-transform">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#4da2ff] text-white ink-border flex items-center justify-center">
                <Search className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-[var(--font-bricolage)] text-lg font-black text-carbon dark:text-white uppercase">
                Lacak Status Pesanan
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold leading-relaxed">
                Pantau proses pembayaran QRIS dan injeksi item secara otomatis hanya dengan memasukkan Nomor Invoice atau Email.
              </p>
            </div>
            <Link
              href="/cek-transaksi"
              className="mt-5 w-full py-2.5 bg-white dark:bg-[#20202e] text-carbon dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-full text-xs font-black uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Lacak Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Channel 3: Guarantee & Replacement */}
          <div className="bg-[#e9ccff] dark:bg-[#231535] dark:border-[#38384a] ink-border rounded-2xl p-6 flex flex-col justify-between relative shadow-[3px_3px_0px_0px_#000000] hover:scale-[1.01] transition-transform">
            <span className="absolute -top-3 right-6 bg-[#fb4903] text-white ink-border rounded-full px-3 py-0.5 text-[10px] font-black uppercase -rotate-2">
              GARANSI 100%
            </span>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#ffd731] ink-border flex items-center justify-center text-black">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-[var(--font-bricolage)] text-lg font-black text-carbon dark:text-white uppercase">
                Kebijakan Pengembalian
              </h3>
              <p className="text-xs text-gray-800 dark:text-gray-300 font-semibold leading-relaxed">
                Seluruh produk dilindungi kebijakan garansi penuh. Jika pesanan gagal terkirim karena kendala server, saldo dikembalikan 100%.
              </p>
            </div>
            <Link
              href="/kebijakan"
              className="mt-5 w-full py-2.5 bg-black text-white hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black ink-border rounded-full text-xs font-black uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Baca Kebijakan Refund</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIZED FAQ ACCORDIONS */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="inline-block bg-[#e9e9e9] dark:bg-[#20202e] dark:border-[#38384a] ink-border rounded-full px-4 py-1 text-xs font-black uppercase text-carbon dark:text-white">
            Pusat Pengetahuan Mandiri
          </span>
          <h2 className="font-[var(--font-bricolage)] text-3xl font-black text-carbon dark:text-white uppercase">
            Pertanyaan Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
            Temukan jawaban instan seputar pembayaran QRIS, kode voucher, dan aktivasi akun.
          </p>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {faqCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#000000] space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-carbon dark:border-gray-700">
                <span className={`w-8 h-8 rounded-full ${cat.badgeColor} ink-border flex items-center justify-center text-xs font-black text-black`}>
                  {idx + 1}
                </span>
                <h3 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                  {cat.category}
                </h3>
              </div>

              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => (
                  <details
                    key={itemIdx}
                    className="group border border-carbon dark:border-[#38384a] rounded-xl p-4 bg-[#fbfbfd] dark:bg-[#12121a] hover:bg-white dark:hover:bg-[#161624] transition-colors"
                  >
                    <summary className="font-extrabold text-sm text-carbon dark:text-white cursor-pointer flex justify-between items-center list-none">
                      <span>{item.q}</span>
                      <span className="ml-2 font-black group-open:rotate-180 transition-transform text-xs">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-3 text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed border-t border-gray-200 dark:border-gray-800 pt-3">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. IN-PAGE ASSISTANCE STICKER BOX (Stitch Sunburst yellow footer card) */}
      <div className="bg-[#ffd731] ink-border rounded-3xl p-6 md:p-10 shadow-[4px_4px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white text-black ink-border rounded-full text-[10px] font-black uppercase">
            ⚡ Respon Cepat
          </div>
          <h3 className="font-[var(--font-bricolage)] text-2xl font-black text-black uppercase">
            Belum Menemukan Jawaban yang Dicari?
          </h3>
          <p className="text-xs font-bold text-black/85 max-w-lg">
            Sampaikan pertanyaan Anda langsung ke tim support kami via WhatsApp untuk mendapatkan solusi dalam hitungan menit.
          </p>
        </div>

        <a
          href={getWhatsAppUrl("Halo Admin XYZPEDIA, saya butuh bantuan")}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3.5 bg-black text-white hover:bg-[#fb4903] ink-border rounded-full text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#ffffff] transition-colors shrink-0"
        >
          Chat WhatsApp Customer Service
        </a>
      </div>
    </div>
  );
}
