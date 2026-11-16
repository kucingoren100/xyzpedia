"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  LockOpen,
  MessageCircle,
  Mail,
  QrCode,
  Landmark,
  Timer,
  Zap,
  Info,
  ChevronRight,
  Gavel,
  Headphones,
  RotateCcw,
  Ban,
  ArrowLeft,
} from "lucide-react";

const SECTIONS = [
  {
    id: "section-1",
    num: "1",
    title: "Ringkasan Transaksi Tamu",
    subtitle: "Prinsip No-Login & Non-Kredensial",
  },
  {
    id: "section-2",
    num: "2",
    title: "Mekanisme Pembayaran QRIS / VA",
    subtitle: "Gateway Bank Indonesia & Validasi",
  },
  {
    id: "section-3",
    num: "3",
    title: "Batas Waktu Otomasi Server API",
    subtitle: "SLA 15 - 90 Detik Dispatch API",
  },
  {
    id: "section-4",
    num: "4",
    title: "Hak Pengembalian Dana (100% Money Back)",
    subtitle: "Klausul Garansi 15 Menit",
  },
  {
    id: "section-5",
    num: "5",
    title: "Perlindungan Privasi WhatsApp & Email",
    subtitle: "Strict Anti-Spam Policy",
  },
  {
    id: "section-6",
    num: "6",
    title: "Layanan Bantuan & Sengketa",
    subtitle: "WhatsApp Escalation Desk 24/7",
  },
];

export default function KebijakanClient() {
  const [activeSection, setActiveSection] = useState<string>("section-1");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-carbon/70 dark:text-gray-300">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#20202e] text-carbon dark:text-white ink-border rounded-full font-bold shadow-[2px_2px_0px_0px_#000000] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-carbon dark:text-white font-extrabold uppercase tracking-tight">
          Kebijakan &amp; Ketentuan Layanan
        </span>
      </nav>

      {/* 2. DOCUMENT HEADER SECTION (Stitch Pop-Brutalism Canvas) */}
      <section className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-12 shadow-[4px_4px_0px_0px_#000000] relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#dceeff] dark:bg-[#152338] ink-border rounded-full opacity-40 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-carbon dark:border-gray-700 relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#55db9c] ink-border rounded-full text-xs font-black uppercase tracking-wider text-black -rotate-1 shadow-[2px_2px_0px_0px_#000000]">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>100% Guest-Direct Legal Security</span>
            </div>

            <h1 className="font-[var(--font-bricolage)] text-2xl sm:text-4xl lg:text-5xl font-extrabold text-carbon dark:text-white tracking-tight uppercase leading-[1.05]">
              Syarat Layanan, Kebijakan Privasi &amp;{" "}
              <span className="text-[#fb4903]">Garansi Refund 100%</span>
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-carbon/80 dark:text-gray-300 leading-relaxed max-w-2xl">
              Pedoman integritas transaksi tanpa akun pelanggan, SLA pemenuhan instan, dan hak garansi pengembalian dana penuh tanpa potongan biaya perbankan.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-bold text-carbon/80 dark:text-gray-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#fb4903] animate-pulse" />
              <span>Berlaku Efektif: 2026 • Versi Transaksi Tamu 3.2</span>
            </div>
          </div>

          {/* Trust Badges Stamp Collage */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <div className="bg-[#ffd731] ink-border px-4 py-3 rounded-2xl flex items-center gap-2.5 rotate-2 shadow-[2px_2px_0px_0px_#000000]">
              <Lock className="w-5 h-5 text-black stroke-[2.5]" />
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-wider text-black">
                  Enkripsi Bank
                </span>
                <span className="block text-xs font-black text-black">ISO/IEC 27001</span>
              </div>
            </div>

            <div className="bg-[#e9ccff] ink-border px-4 py-3 rounded-2xl flex items-center gap-2.5 -rotate-2 shadow-[2px_2px_0px_0px_#000000]">
              <RotateCcw className="w-5 h-5 text-black stroke-[2.5]" />
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-wider text-black">
                  Refund Garansi
                </span>
                <span className="block text-xs font-black text-black">15 Menit Otomatis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Quick Jump */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-2">
          <button
            type="button"
            onClick={() => handleScrollTo("section-1")}
            className="bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full ink-border hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[2px_2px_0px_0px_#ffd731] cursor-pointer"
          >
            Syarat &amp; Ketentuan Layanan
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo("section-2")}
            className="bg-white dark:bg-[#20202e] text-carbon dark:text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full ink-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            Mekanisme Pembayaran QRIS
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo("section-4")}
            className="bg-white dark:bg-[#20202e] text-carbon dark:text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full ink-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#fb4903]" />
            <span>Garansi Refund 100%</span>
          </button>
          <button
            type="button"
            onClick={() => handleScrollTo("section-5")}
            className="bg-white dark:bg-[#20202e] text-carbon dark:text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full ink-border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            Kebijakan Privasi Tamu
          </button>
        </div>
      </section>

      {/* 3. TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* STICKY SIDEBAR NAVIGATION (LEFT: 4 cols) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4">
          
          {/* Index Klausul Card */}
          <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000000] space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-carbon dark:border-gray-700">
              <span className="text-xs font-black uppercase tracking-wider text-carbon dark:text-white flex items-center gap-2">
                <Gavel className="w-4 h-4 text-[#5c4ade]" />
                <span>Daftar Klausul Legal</span>
              </span>
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase bg-[#f3f4f6] dark:bg-[#20202e] dark:border-[#38384a] px-2 py-0.5 rounded ink-border">
                6 Butir
              </span>
            </div>

            <nav aria-label="Index Kebijakan" className="flex flex-col gap-1.5 text-xs">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleScrollTo(sec.id)}
                    className={`w-full text-left flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#ffd731]/30 dark:bg-[#ffd731]/15 ink-border shadow-[1.5px_1.5px_0px_0px_#000000]"
                        : "hover:bg-[#dceeff] dark:hover:bg-[#20202e] ink-border border-transparent hover:border-carbon dark:hover:border-gray-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ink-border ${
                        isActive
                          ? "bg-[#fb4903] text-white"
                          : "bg-white dark:bg-[#20202e] text-carbon dark:text-white"
                      }`}
                    >
                      {sec.num}
                    </span>
                    <div>
                      <p
                        className={`font-black leading-snug ${
                          isActive
                            ? "text-carbon dark:text-white"
                            : "text-carbon/90 dark:text-gray-300 group-hover:text-[#fb4903]"
                        }`}
                      >
                        {sec.title}
                      </p>
                      <span
                        className={`text-[10px] block ${
                          isActive
                            ? "text-[#fb4903] font-black"
                            : "text-gray-500 dark:text-gray-400 font-bold"
                        }`}
                      >
                        {sec.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Fast Audit Callout Card (Lavender) */}
          <div className="bg-[#e9ccff] dark:bg-[#201530] dark:border-[#38384a] ink-border rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000000] space-y-3">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#5c4ade]" />
              <h3 className="text-xs font-black uppercase text-carbon dark:text-white tracking-wider">
                Status Kepatuhan Hukum
              </h3>
            </div>
            <p className="text-xs font-semibold text-carbon/90 dark:text-gray-300 leading-relaxed">
              Operasional sistem XYZPEDIA tunduk penuh pada UU ITE Republik Indonesia No. 1 Tahun 2024 dan Regulasi Perlindungan Data Pribadi (UU PDP).
            </p>
            <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-xl p-3 flex items-center justify-between shadow-[1px_1px_0px_0px_#000000]">
              <span className="text-xs font-black text-carbon dark:text-white">Audit Otomasi Sistem</span>
              <span className="px-2.5 py-0.5 bg-[#55db9c] text-black ink-border rounded-full text-[10px] font-black uppercase">
                Lolos Uji
              </span>
            </div>
          </div>

          {/* Contact CS Quick Pill */}
          <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-2xl p-4 flex items-center justify-between shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#55db9c] ink-border flex items-center justify-center font-black">
                <Headphones className="w-5 h-5 text-black" />
              </span>
              <div>
                <p className="text-xs font-black text-carbon dark:text-white">Butuh Bantuan Sengketa?</p>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Respon rerata 4 menit</span>
              </div>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20XYZPEDIA,%20saya%20ingin%20konsultasi%20kendala%20transaksi"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-black text-white ink-border rounded-full text-xs font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-[1.5px_1.5px_0px_0px_#ffd731]"
            >
              Chat WA
            </a>
          </div>
        </aside>

        {/* MAIN LEGAL BODY (RIGHT: 8 cols) - 1 to 1 matched in exact sequence */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* SECTION 1: Guest-Direct Philosophy (Klausul 01) */}
          <article
            className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[3px_3px_0px_0px_#000000] space-y-4 scroll-mt-28"
            id="section-1"
          >
            <div className="flex items-start justify-between gap-4 border-b border-carbon dark:border-gray-700 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-0.5 bg-black text-white text-[10px] font-black uppercase rounded-full">
                  Klausul 01
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Tatanan Guest-Direct</span>
              </div>
              <LockOpen className="w-5 h-5 text-gray-400" />
            </div>

            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white">
              1. Prinsip Pembelian Tamu (Guest-Direct)
            </h2>

            <div className="space-y-3 text-xs sm:text-sm font-semibold text-carbon/90 dark:text-gray-300 leading-relaxed">
              <p>
                XYZPEDIA beroperasi di bawah mandat arsitektur <strong>100% Guest-Direct</strong>. Seluruh proses pemilihan voucher game, langganan digital, hingga konfirmasi pembayaran tidak pernah dan tidak akan pernah mewajibkan pembeli membuat akun kata sandi, verifikasi OTP registrasi rumit, maupun pengikatan kartu kredit.
              </p>

              {/* Structural Callout Box (Sky Wash) */}
              <div className="bg-[#dceeff] dark:bg-[#152338] dark:border-[#2d3f5e] ink-border rounded-2xl p-4 my-3 space-y-2">
                <h4 className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#005ea5] dark:text-[#55a8ff]" />
                  <span>Komitmen Nir-Kredensial XYZPEDIA:</span>
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-carbon/90 dark:text-gray-200 font-medium">
                  <li>
                    Kami <strong>TIDAK PERNAH</strong> menanyakan atau menyimpan kata sandi (password) akun game Moonton, Riot ID, Steam, maupun email pribadi pengguna.
                  </li>
                  <li>
                    Hanya <strong>User ID dan Zone/Server ID publik</strong> yang dibutuhkan untuk memvalidasi tujuan transfer top-up koin atau diamond.
                  </li>
                  <li>
                    Invoice digital diterbitkan secara independen berbasis Token Transaksi yang dapat dilacak pada menu <em>Lacak Pesanan</em> tanpa histori akun tertanam.
                  </li>
                </ul>
              </div>

              <p>
                Dengan mengeksekusi pesanan, pengguna menyetujui bahwa validitas User ID dan Server ID yang dimasukkan sepenuhnya merupakan tanggung jawab pengguna. Sistem otentikasi publisher otomatis kami memverifikasi nama karakter (In-Game Name) sebelum jendela pembayaran dibuka untuk meminimalisir kesalahan salah sasaran akun.
              </p>
            </div>
          </article>

          {/* SECTION 2: Payment Security QRIS / VA (Klausul 02) */}
          <article
            className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[3px_3px_0px_0px_#000000] space-y-4 scroll-mt-28"
            id="section-2"
          >
            <div className="flex items-center gap-3 border-b border-carbon dark:border-gray-700 pb-3">
              <span className="px-3 py-0.5 bg-black text-white text-[10px] font-black uppercase rounded-full">
                Klausul 02
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Protokol Finansial</span>
            </div>

            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white">
              2. Mekanisme Pemesanan &amp; Pembayaran QRIS / VA
            </h2>

            <div className="space-y-4 text-xs sm:text-sm font-semibold text-carbon/90 dark:text-gray-300 leading-relaxed">
              <p>
                Seluruh transaksi moneter di platform XYZPEDIA diproses oleh Payment Gateway aggregator berlisensi resmi Bank Indonesia dengan standar enkripsi <strong>AES 256-bit PCI-DSS Level 1</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="ink-border rounded-2xl p-4 bg-[#dceeff] dark:bg-[#152338] dark:border-[#2d3f5e] space-y-1.5 shadow-[1px_1px_0px_0px_#000000]">
                  <QrCode className="w-6 h-6 text-[#005ea5] dark:text-[#55a8ff] mb-1" />
                  <h4 className="text-xs font-black uppercase text-carbon dark:text-white">QRIS Dinamis Real-Time</h4>
                  <p className="text-[11px] font-normal text-carbon/80 dark:text-gray-300 leading-relaxed">
                    Kode QR unik diterbitkan khusus per nominal tagihan beserta 3 digit kode unik pengenal transaksi otomatis.
                  </p>
                </div>

                <div className="ink-border rounded-2xl p-4 bg-white dark:bg-[#12121a] dark:border-[#38384a] space-y-1.5 shadow-[1px_1px_0px_0px_#000000]">
                  <Landmark className="w-6 h-6 text-[#5c4ade] dark:text-[#9e8dff] mb-1" />
                  <h4 className="text-xs font-black uppercase text-carbon dark:text-white">Virtual Account Resmi</h4>
                  <p className="text-[11px] font-normal text-carbon/80 dark:text-gray-300 leading-relaxed">
                    Koneksi langsung ke BCA, Mandiri, BRI, dan BNI dengan validasi status otomatis seketika.
                  </p>
                </div>

                <div className="ink-border rounded-2xl p-4 bg-white dark:bg-[#12121a] dark:border-[#38384a] space-y-1.5 shadow-[1px_1px_0px_0px_#000000]">
                  <Timer className="w-6 h-6 text-[#fb4903] mb-1" />
                  <h4 className="text-xs font-black uppercase text-carbon dark:text-white">Batas Waktu 30 Menit</h4>
                  <p className="text-[11px] font-normal text-carbon/80 dark:text-gray-300 leading-relaxed">
                    Menghindari floating invoice. Jika tidak terbayar dalam 30 menit, tagihan hangus otomatis demi integritas stok kuota.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* SECTION 3: API Dispatch & Publisher SLA (Klausul 03) */}
          <article
            className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[3px_3px_0px_0px_#000000] space-y-4 scroll-mt-28"
            id="section-3"
          >
            <div className="flex items-center gap-3 border-b border-carbon dark:border-gray-700 pb-3">
              <span className="px-3 py-0.5 bg-black text-white text-[10px] font-black uppercase rounded-full">
                Klausul 03
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Integrasi Server</span>
            </div>

            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white">
              3. Batas Waktu Otomasi Server Moonton &amp; Publisher
            </h2>

            <div className="space-y-4 text-xs sm:text-sm font-semibold text-carbon/90 dark:text-gray-300 leading-relaxed">
              <p>
                Fasilitas pengisian diamond dan aktivasi voucher dieksekusi oleh microservices server yang terhubung secara resmi ke API distributor berlisensi:
              </p>

              <div className="ink-border rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_#000000]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-black text-white text-[11px] font-black uppercase">
                      <th className="p-3 border-r border-carbon dark:border-gray-700">Kategori Layanan</th>
                      <th className="p-3 border-r border-carbon dark:border-gray-700">Target SLA Pengiriman</th>
                      <th className="p-3">Kondisi Luar Biasa (Fail-Safe)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-carbon dark:divide-gray-800 bg-white dark:bg-[#12121a] font-medium">
                    <tr>
                      <td className="p-3 font-bold border-r border-carbon dark:border-gray-700 text-carbon dark:text-white">
                        Mobile Legends, Free Fire, PUBG, Genshin
                      </td>
                      <td className="p-3 border-r border-carbon dark:border-gray-700 text-green-700 dark:text-green-400 bg-[#55db9c]/10 font-black">
                        15 - 90 Detik
                      </td>
                      <td className="p-3 text-[11px] text-gray-600 dark:text-gray-400">
                        Server overload saat event reset bulanan: Maksimal 15 menit.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold border-r border-carbon dark:border-gray-700 text-carbon dark:text-white">
                        Voucher Steam Wallet, Google Play, Roblox
                      </td>
                      <td className="p-3 border-r border-carbon dark:border-gray-700 text-[#005ea5] dark:text-[#55a8ff] font-black">
                        Instan (Di Layar &amp; WA)
                      </td>
                      <td className="p-3 text-[11px] text-gray-600 dark:text-gray-400">
                        Serial key dikirim dalam invoice visual terenkripsi.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold border-r border-carbon dark:border-gray-700 text-carbon dark:text-white">
                        Akun Langganan (Spotify, Netflix, YouTube, Canva)
                      </td>
                      <td className="p-3 border-r border-carbon dark:border-gray-700 font-black text-[#5c4ade] dark:text-[#a899ff]">
                        1 - 5 Menit
                      </td>
                      <td className="p-3 text-[11px] text-gray-600 dark:text-gray-400">
                        Kredensial aktivasi disalurkan khusus melalui WhatsApp &amp; Email tertera.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          {/* SECTION 4: 100% Refund Guarantee (Klausul 04) */}
          <article
            className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[3px_3px_0px_0px_#000000] space-y-4 relative overflow-hidden scroll-mt-28"
            id="section-4"
          >
            {/* Decorative Sticker Stamp */}
            <div className="absolute -top-3 -right-3 bg-[#ffd731] ink-border px-4 py-2 rounded-xl rotate-6 z-10 flex items-center gap-1 text-[11px] font-black uppercase text-black shadow-[2px_2px_0px_0px_#000000]">
              <Zap className="w-3.5 h-3.5 fill-[#fb4903] text-[#fb4903]" />
              <span>SLA 15 Menit</span>
            </div>

            <div className="flex items-center gap-3 border-b border-carbon dark:border-gray-700 pb-3">
              <span className="px-3 py-0.5 bg-[#fb4903] text-white text-[10px] font-black uppercase rounded-full">
                Klausul 04 • Garansi Mutlak
              </span>
            </div>

            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white">
              4. Hak Pengembalian Dana (100% Money Back)
            </h2>

            <div className="space-y-4 text-xs sm:text-sm font-semibold text-carbon/90 dark:text-gray-300 leading-relaxed">
              <p>
                Kami mengerti bahwa kecepatan adalah segalanya bagi pemain game dan pelanggan digital. XYZPEDIA memberlakukan <strong>Garansi Perlindungan Pengembalian Dana Penuh 100%</strong> tanpa potongan biaya administrasi perbankan dengan syarat dan ketentuan berikut:
              </p>

              {/* Refund Trigger Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="bg-[#f3f4f6] dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-2xl p-4 flex flex-col justify-between shadow-[1px_1px_0px_0px_#000000]">
                  <div>
                    <div className="w-7 h-7 rounded-full bg-[#fb4903] text-white flex items-center justify-center font-black text-xs mb-2 ink-border">
                      A
                    </div>
                    <h4 className="text-xs font-black uppercase text-carbon dark:text-white mb-1">
                      Keterlambatan Server &gt; 15 Menit
                    </h4>
                    <p className="text-xs font-normal text-carbon/80 dark:text-gray-300 leading-relaxed">
                      Jika top-up game atau lisensi akun langganan gagal masuk dalam durasi 15 menit setelah pembayaran QRIS/VA tervalidasi sukses oleh gateway perbankan.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-carbon/20 dark:border-gray-700 text-[11px] text-[#fb4903] font-black">
                    Status: Otomatis Dapat Direfund 100%
                  </div>
                </div>

                <div className="bg-[#f3f4f6] dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-2xl p-4 flex flex-col justify-between shadow-[1px_1px_0px_0px_#000000]">
                  <div>
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-black text-xs mb-2 ink-border">
                      B
                    </div>
                    <h4 className="text-xs font-black uppercase text-carbon dark:text-white mb-1">
                      Stok Kosong / API Publisher Down
                    </h4>
                    <p className="text-xs font-normal text-carbon/80 dark:text-gray-300 leading-relaxed">
                      Apabila terjadi antrean pemeliharaan tak terjadwal dari pihak official publisher (misal: Maintenance darurat Moonton/Steam).
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-carbon/20 dark:border-gray-700 text-[11px] text-carbon dark:text-gray-200 font-black">
                    Status: Opsi Refund Penuh / Tunggu Update
                  </div>
                </div>
              </div>

              {/* Accent Flow Box (Voltage Violet) */}
              <div className="bg-[#5c4ade] text-white ink-border rounded-2xl p-5 space-y-2 shadow-[2px_2px_0px_0px_#000000]">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#ffd731]" />
                  <span>Mekanisme Eksekusi Refund Cepat:</span>
                </h4>
                <p className="text-xs font-normal opacity-90 leading-relaxed">
                  Pelanggan cukup memasukkan Nomor Invoice pada halaman <em>Lacak Pesanan</em> atau menghubungi WhatsApp Support dengan melampirkan bukti transfer QRIS. Dana akan dikirimkan langsung kembali ke E-Wallet (GoPay, OVO, Dana) atau Rekening Bank asal dalam waktu 1x24 jam kerja.
                </p>
                <div className="inline-flex items-center gap-1.5 bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase ink-border mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                  <span>Biaya Transaksi QRIS Digratiskan (0% Penalty)</span>
                </div>
              </div>
            </div>
          </article>

          {/* SECTION 5: Data Privacy & Strict Anti-Spam (Klausul 05) */}
          <article
            className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[3px_3px_0px_0px_#000000] space-y-4 scroll-mt-28"
            id="section-5"
          >
            <div className="flex items-center gap-3 border-b border-carbon dark:border-gray-700 pb-3">
              <span className="px-3 py-0.5 bg-[#55db9c] text-black text-[10px] font-black uppercase rounded-full ink-border">
                Klausul 05 • Keamanan Privasi
              </span>
            </div>

            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white">
              5. Kebijakan Privasi Data Tamu (WhatsApp &amp; Email)
            </h2>

            <div className="space-y-4 text-xs sm:text-sm font-semibold text-carbon/90 dark:text-gray-300 leading-relaxed">
              <p>
                XYZPEDIA menjunjung tinggi martabat privasi para gamer dan digital native. Dalam setiap transaksi, kami hanya mengumpulkan <strong>2 titik data kontak</strong>: Nomor WhatsApp dan Alamat Email opsional.
              </p>

              <div className="bg-[#ffd731]/15 dark:bg-[#ffd731]/10 dark:border-[#38384a] ink-border rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-2">
                  <Ban className="w-4 h-4 text-[#fb4903]" />
                  <span>Prinsip Tanpa Spam &amp; Non-Komersialisasi Data:</span>
                </h4>
                <p className="text-xs text-carbon/90 dark:text-gray-300">
                  Nomor WhatsApp dan email Anda <strong>HANYA</strong> akan digunakan secara otomatis oleh bot pengirim untuk:
                </p>
                <ul className="list-disc pl-5 text-xs text-carbon/80 dark:text-gray-300 space-y-1 font-normal">
                  <li>Mengirim tautan bukti invoice pembayaran QRIS / Virtual Account.</li>
                  <li>Menyampaikan kode serial voucher atau notifikasi pengiriman item berhasil.</li>
                  <li>Notifikasi konfirmasi pengembalian dana (refund) apabila pesanan mengalami kendala.</li>
                </ul>
                <p className="text-xs font-black text-carbon dark:text-white pt-1">
                  Kami MENJAMIN 100% data nomor kontak Anda TIDAK AKAN diperjualbelikan, ditautkan ke database telemarketing, atau dibombardir pesan siaran (broadcast) promo berkala.
                </p>
              </div>
            </div>
          </article>

          {/* SECTION 6: Dispute & Escalation (Klausul 06) */}
          <article
            className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 shadow-[3px_3px_0px_0px_#000000] space-y-4 scroll-mt-28"
            id="section-6"
          >
            <div className="flex items-center gap-3 border-b border-carbon dark:border-gray-700 pb-3">
              <span className="px-3 py-0.5 bg-black text-white text-[10px] font-black uppercase rounded-full">
                Klausul 06
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Resolusi Sengketa</span>
            </div>

            <h2 className="font-[var(--font-bricolage)] text-xl sm:text-2xl font-black uppercase text-carbon dark:text-white">
              6. Layanan Bantuan, Eskalasi &amp; Sengketa Pelanggan
            </h2>

            <div className="space-y-4 text-xs sm:text-sm font-semibold text-carbon/90 dark:text-gray-300 leading-relaxed">
              <p>
                Segala bentuk ketidaksesuaian jumlah item, kendala validasi pembayaran perbankan, atau pertanyaan terkait ketentuan ini diselesaikan secara musyawarah mufakat melalui kanal resmi kami:
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20XYZPEDIA,%20saya%20ingin%20lapor%20kendala%20transaksi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 ink-border rounded-2xl p-4 bg-[#f3f4f6] dark:bg-[#12121a] dark:border-[#38384a] hover:bg-[#55db9c]/20 transition-all flex items-center gap-3.5 group shadow-[1px_1px_0px_0px_#000000]"
                >
                  <span className="w-11 h-11 rounded-xl bg-[#55db9c] ink-border flex items-center justify-center font-black group-hover:scale-105 transition-transform shrink-0">
                    <MessageCircle className="w-5 h-5 text-black" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-carbon dark:text-white">WhatsApp CS 24 Jam</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">+62 812-9988-XYZP (Chat Only)</p>
                  </div>
                </a>

                <a
                  href="mailto:dispute@xyzpedia.id"
                  className="flex-1 ink-border rounded-2xl p-4 bg-[#f3f4f6] dark:bg-[#12121a] dark:border-[#38384a] hover:bg-[#ffd731]/20 transition-all flex items-center gap-3.5 group shadow-[1px_1px_0px_0px_#000000]"
                >
                  <span className="w-11 h-11 rounded-xl bg-[#ffd731] ink-border flex items-center justify-center font-black group-hover:scale-105 transition-transform shrink-0">
                    <Mail className="w-5 h-5 text-black" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-carbon dark:text-white">Email Helpdesk Legal</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">dispute@xyzpedia.id</p>
                  </div>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
