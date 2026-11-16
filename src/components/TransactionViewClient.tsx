"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { checkPaymentStatus, simulatePaymentSuccess } from "@/app/actions/order";
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  ArrowLeft,
  RotateCw,
  Download,
  ShieldCheck,
  Key,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  invoiceNumber: string;
  targetUserId: string;
  targetZoneId: string | null;
  customerEmail: string;
  customerPhone: string | null;
  basePrice: number;
  uniqueCode: number;
  fee: number;
  totalAmount: number;
  status: string;
  qrisString: string | null;
  paidAt: Date | null;
  createdAt: Date;
  product: {
    name: string;
    slug: string;
    categorySlug: string;
    developer: string | null;
    thumbnailUrl: string;
  };
  productItem: {
    name: string;
  };
}

export default function TransactionViewClient({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const getRemainingSeconds = () => {
    if (!initialOrder?.createdAt) return 15 * 60;
    const createdAtTime = new Date(initialOrder.createdAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAtTime) / 1000));
    return Math.max(0, 15 * 60 - elapsedSeconds);
  };

  const [timeLeft, setTimeLeft] = useState(getRemainingSeconds);

  // Auto-poll payment status every 4 seconds when order is pending
  useEffect(() => {
    if (order.status === "SUCCESS" || order.status === "PAID") return;

    const interval = setInterval(async () => {
      try {
        const res = await checkPaymentStatus(order.invoiceNumber);
        if (res.success && res.isPaid && res.order) {
          setOrder(res.order as any);
        }
      } catch {
        // Silent polling error
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order.invoiceNumber, order.status]);

  // Sync remaining countdown timer from actual order.createdAt
  useEffect(() => {
    if (order.status !== "PENDING") return;

    const calculateTime = () => {
      const createdAtTime = new Date(order.createdAt).getTime();
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAtTime) / 1000));
      return Math.max(0, 15 * 60 - elapsedSeconds);
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      const remaining = calculateTime();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order.createdAt, order.status]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(order.totalAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(order.invoiceNumber);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await simulatePaymentSuccess(order.invoiceNumber);
      if (res.success && res.order) {
        setOrder((prev) => ({
          ...prev,
          status: "SUCCESS",
          paidAt: new Date(),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleManualCheckStatus = async () => {
    setIsChecking(true);
    try {
      const res = await checkPaymentStatus(order.invoiceNumber);
      if (res.success) {
        if (res.isPaid && res.order) {
          setOrder(res.order as any);
        } else {
          alert("Pembayaran belum terdeteksi di mutasi QRIS. Pastikan Anda sudah menyelesaikan transfer sesuai nominal yang tertera.");
        }
      } else {
        alert(res.error || "Gagal memeriksa status pembayaran.");
      }
    } catch {
      alert("Koneksi gagal. Silakan coba beberapa saat lagi.");
    } finally {
      setIsChecking(false);
    }
  };

  const isSuccess = order.status === "SUCCESS" || order.status === "PAID";

  const isAkunPremium = order.product.categorySlug === "akun-premium";
  const isManualAccount =
    isAkunPremium &&
    ((order.product.developer || "").toLowerCase() === "manual" ||
      [
        "apple-music",
        "hbo-max",
        "youtube-premium",
        "canva-pro",
        "chatgpt",
        "gemini",
      ].includes(order.product.slug));

  const waAdminNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890";
  const waOrderText = `Halo Admin XYZPEDIA, saya sudah menyelesaikan pembayaran untuk pesanan Akun Premium (Proses Manual).

📌 No. Invoice: ${order.invoiceNumber}
📦 Produk: ${order.product.name}
💎 Varian: ${order.productItem.name}
💰 Total Bayar: Rp ${order.totalAmount.toLocaleString("id-ID")}
👤 Kontak Pembeli: ${order.customerPhone || order.targetUserId}

Mohon untuk dikirimkan kredensial akun saya ya min. Terima kasih!`;

  const waOrderUrl = `https://wa.me/${waAdminNumber}?text=${encodeURIComponent(waOrderText)}`;

  // Deterministic generated credentials for premium account orders
  const invSuffix = order.invoiceNumber.slice(-4);
  const netflixEmail = `xyz.vip.user${invSuffix}@streamhub.id`;
  const netflixPassword = `XyzPedia#${invSuffix}!`;
  const profileNum = Math.floor(1 + ((order.totalAmount + 1) % 4));
  const profilePin = `${invSuffix}`;

  const spotifyLink = `https://www.spotify.com/id-id/family/redeem/?token=XYZ-${order.invoiceNumber.slice(-6)}`;
  const spotifyAddress = `Jl. Jenderal Sudirman Kav. 52-53, Senayan, Jakarta Selatan, 12190`;

  const youtubeLink = `https://families.google.com/join/XYZPEDIA-${order.invoiceNumber.slice(-6)}`;

  const voucherCode = `STM-${invSuffix}-${order.invoiceNumber.slice(-8, -4)}-${Math.floor(1000 + (order.totalAmount % 9000))}`;

  const copyAllNetflix = () => {
    const text = `[XYZPEDIA CREDENTIALS]\nLayanan: ${order.product.name}\nPaket: ${order.productItem.name}\nEmail: ${netflixEmail}\nPassword: ${netflixPassword}\nProfil: Profil ${profileNum}\nPIN Profil: ${profilePin}\nGaransi: 30 Hari Full Replacement`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const copyAllSpotify = () => {
    const text = `[XYZPEDIA SPOTIFY INVITE]\nLayanan: ${order.product.name} - ${order.productItem.name}\nLink Aktivasi: ${spotifyLink}\nAlamat Konfirmasi: ${spotifyAddress}\nEmail Penerima: ${order.targetUserId}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#1a1a26] ink-border dark:border-[#38384a] text-carbon dark:text-white rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000] hover:bg-gray-100 dark:hover:bg-[#252538] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2">
          {isSuccess ? (
            <span className="px-3 py-1 bg-[#55db9c] text-black ink-border rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000]">
              ✓ PEMBAYARAN SUKSES
            </span>
          ) : (
            <span className="px-3 py-1 bg-[#ffd731] text-black ink-border rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000] animate-pulse">
              ⏳ MENUNGGU SETTLEMENT QRIS
            </span>
          )}
        </div>
      </div>

      {/* STITCH HEADER SUMMARY BANNER */}
      <div className="relative w-full bg-white dark:bg-[#161622] rounded-3xl ink-border dark:border-[#38384a] p-6 md:p-8 overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#55db9c] text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full ink-border">
                {isSuccess ? "SELESAI & TERKIRIM" : "QRIS DINAMIS AKTIF"}
              </span>
              <button
                type="button"
                onClick={handleCopyInvoice}
                className="inline-flex items-center gap-1 bg-[#e9e9e9] dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#2f2f45] px-2.5 py-0.5 rounded-full ink-border dark:border-[#38384a] text-[10px] font-black text-carbon dark:text-white cursor-pointer"
              >
                <span>{order.invoiceNumber}</span>
                {copiedInvoice ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <h1 className="font-[var(--font-bricolage)] text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-carbon dark:text-white">
              {isSuccess ? "Pembayaran Terverifikasi & Selesai! 🎉" : "Menunggu Pembayaran QRIS"}
            </h1>

            <p className="text-xs font-bold text-gray-600 dark:text-gray-300 max-w-xl">
              Pesanan untuk <span className="text-carbon dark:text-white font-black">{order.product.name} ({order.productItem.name})</span>. Bukti transaksi resmi dikirim otomatis ke{" "}
              <span className="text-carbon dark:text-white font-black">{order.customerEmail}</span>.
            </p>
          </div>

          {/* Tilted Expiration Countdown Timer Box */}
          {!isSuccess && (
            <div className="bg-[#ffd731] ink-border rounded-2xl p-4 flex flex-col items-center justify-center w-full sm:w-auto min-w-0 sm:min-w-[220px] transform sm:-rotate-1 self-stretch sm:self-auto shadow-[3px_3px_0px_0px_#000000]">
              <span className="text-[10px] font-black uppercase tracking-wider text-black">
                BATAS WAKTU BAYAR
              </span>
              <div className="font-[var(--font-bricolage)] text-3xl font-extrabold text-black tracking-tight tabular-nums mt-0.5">
                {formatTimer(timeLeft)}
              </div>
              <span className="text-[9px] font-bold text-black/80 mt-0.5">
                QRIS otomatis expired jika lewat
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: QR View or Success View */}
      {isSuccess ? (
        <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-10 text-center space-y-8 shadow-[4px_4px_0px_0px_#000000] max-w-4xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#55db9c] ink-border flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000000]">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>

          <div className="space-y-1">
            <h2 className="font-[var(--font-bricolage)] text-2xl md:text-3xl font-black uppercase text-carbon dark:text-white">
              {isManualAccount
                ? "Pembayaran Sukses! Pesanan Sedang Diproses"
                : "Transaksi Selesai & Item Terkirim!"}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              {isManualAccount
                ? "Pembayaran telah terverifikasi secara otomatis oleh sistem. Karena produk ini bertipe pemrosesan manual, silakan klik tombol WhatsApp di bawah untuk konfirmasi dan menerima kredensial akun dari Admin."
                : "Pembayaran telah terverifikasi secara otomatis. Rincian pesanan dan kredensial akses akun Anda tercantum di bawah ini."}
            </p>
          </div>

          {/* 1. DEDICATED KREDENSIAL BOX (For Akun & Langganan Premium) */}
          {order.product.categorySlug === "akun-premium" && (
            isManualAccount ? (
              <div className="border-2 border-carbon dark:border-[#38384a] rounded-3xl p-6 md:p-8 bg-[#fff3d4] dark:bg-[#201d14] text-left space-y-6 shadow-[4px_4px_0px_0px_#000000]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-carbon/20 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-[#ffd731] text-black rounded-xl ink-border shrink-0 shadow-[1px_1px_0px_#000000]">
                      <Clock className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                        Kredensial Akun (Proses Manual)
                      </h3>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Kredensial login tidak langsung tampil di layar demi keamanan slot akun
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#4b5563] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full ink-border shadow-[1px_1px_0px_0px_#000000] w-fit">
                    🕒 PROSES MANUAL OLEH ADMIN
                  </span>
                </div>

                {/* Status Alert Banner */}
                <div className="p-4 bg-white dark:bg-[#181824] ink-border rounded-2xl space-y-2 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#55db9c] ink-border animate-ping" />
                    <span className="text-xs font-black uppercase text-green-700 dark:text-green-400">
                      Pembayaran QRIS Berhasil & Terkonfirmasi
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                    Pesanan untuk <strong>{order.product.name} ({order.productItem.name})</strong> telah lunas. Kredensial akun (Email / Sandi / Tautan Undangan) akan disiapkan dan diserahkan secara langsung oleh Admin XYZPEDIA melalui WhatsApp.
                  </p>
                </div>

                {/* Rincian Pesanan Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-[#181824] ink-border rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase font-black block">Nomor Invoice:</span>
                    <span className="font-mono font-black text-carbon dark:text-white">{order.invoiceNumber}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#181824] ink-border rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase font-black block">Item & Paket:</span>
                    <span className="font-black text-carbon dark:text-white">{order.product.name} - {order.productItem.name}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#181824] ink-border rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase font-black block">Target User / Kontak:</span>
                    <span className="font-black text-[#fb4903]">{order.customerPhone || order.targetUserId}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#181824] ink-border rounded-xl">
                    <span className="text-[10px] text-gray-500 uppercase font-black block">Estimasi Waktu Penyerahan:</span>
                    <span className="font-black text-carbon dark:text-white">3 - 10 Menit (Admin Standby 24/7)</span>
                  </div>
                </div>

                {/* Big WhatsApp CTA Button */}
                <a
                  href={waOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black py-4 px-6 rounded-2xl ink-border text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-center"
                >
                  <ExternalLink className="w-5 h-5 shrink-0" />
                  <span>KLIK DI SINI: KONFIRMASI KE WHATSAPP ADMIN SEKARANG</span>
                </a>

                <div className="p-3 bg-white/80 dark:bg-[#181824]/80 ink-border rounded-xl text-center text-[11px] font-bold text-gray-600 dark:text-gray-400">
                  🛡️ <strong>Garansi Penuh 30 Hari:</strong> Seluruh produk akun premium kami dilindungi garansi replace 30 hari penuh. Silakan simpan No. Invoice Anda.
                </div>
              </div>
            ) : (
            <div className="border-2 border-carbon dark:border-[#38384a] rounded-3xl p-6 md:p-8 bg-[#e9ccff]/30 dark:bg-[#e9ccff]/10 text-left space-y-5 shadow-[4px_4px_0px_0px_#000000]">
              <div className="flex items-center justify-between border-b border-carbon dark:border-gray-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#fb4903] ink-border" />
                  <span className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                    Kredensial Akses Langsung Akun
                  </span>
                </div>
                <span className="bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-full ink-border shadow-[1px_1px_0px_0px_#ffd731]">
                  GARANSI 30 HARI FULL
                </span>
              </div>

              {/* Sub-variant Netflix Premium */}
              {order.product.slug === "netflix-premium" ? (
                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="bg-white dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
                    <div>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                        Email Login Netflix:
                      </span>
                      <span className="font-mono text-sm font-black text-carbon dark:text-white select-all">
                        {netflixEmail}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(netflixEmail, "email")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-lg transition-colors"
                      title="Salin Email"
                    >
                      {copiedKey === "email" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-carbon dark:text-gray-200" />
                      )}
                    </button>
                  </div>

                  {/* Password & Profile PIN Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
                      <div>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                          Password Akun:
                        </span>
                        <span className="font-mono text-sm font-black text-carbon dark:text-white select-all tracking-wider">
                          {netflixPassword}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(netflixPassword, "pass")}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-lg transition-colors"
                        title="Salin Sandi"
                      >
                        {copiedKey === "pass" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-carbon dark:text-gray-200" />
                        )}
                      </button>
                    </div>

                    <div className="bg-white dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
                      <div>
                        <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                          Slot Profil & PIN:
                        </span>
                        <span className="font-mono text-sm font-black text-[#fb4903] select-all">
                          Profil {profileNum} [PIN: {profilePin}]
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(`Profil ${profileNum} [PIN: ${profilePin}]`, "pin")}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-lg transition-colors"
                        title="Salin PIN"
                      >
                        {copiedKey === "pin" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-carbon dark:text-gray-200" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Copy Action Button */}
                  <button
                    type="button"
                    onClick={copyAllNetflix}
                    className="w-full bg-black text-white hover:bg-[#5c4ade] py-3.5 px-4 rounded-full ink-border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#ffd731] transition-all active:scale-[0.98]"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Seluruh Kredensial Berhasil Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Akun, Password & PIN (Satu Klik)</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-white/90 dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl text-center text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    ⚠️ <strong>Aturan Pemakaian:</strong> 1 Device 1 Profil. Dilarang mengganti password akun atau mengubah profil pengguna lain demi kelancaran garansi.
                  </div>
                </div>
              ) : order.product.slug === "spotify-premium" ? (
                <div className="space-y-4">
                  {/* Spotify Invite Link */}
                  <div className="bg-white dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl p-3.5 space-y-1 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                      Link Aktivasi Resmi Family Plan:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-[#5c4ade] dark:text-[#a899ff] truncate select-all">
                        {spotifyLink}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(spotifyLink, "spotLink")}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-lg transition-colors shrink-0"
                        title="Salin Link"
                      >
                        {copiedKey === "spotLink" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-carbon dark:text-gray-200" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Address to enter */}
                  <div className="bg-white dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
                    <div>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                        Alamat Konfirmasi Spotify Family:
                      </span>
                      <span className="font-mono text-xs font-black text-carbon dark:text-white select-all">
                        {spotifyAddress}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(spotifyAddress, "spotAddr")}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-lg transition-colors shrink-0"
                      title="Salin Alamat"
                    >
                      {copiedKey === "spotAddr" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-carbon dark:text-gray-200" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={copyAllSpotify}
                    className="w-full bg-black text-white hover:bg-[#5c4ade] py-3.5 px-4 rounded-full ink-border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#ffd731] transition-all active:scale-[0.98]"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Link & Alamat Berhasil Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Link & Alamat Family (Satu Klik)</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-white/90 dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl text-center text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    💡 <strong>Cara Pakai:</strong> Buka link aktivasi di atas dengan akun Spotify Anda ({order.targetUserId}), lalu masukkan alamat di atas saat Spotify meminta verifikasi alamat.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* YouTube / Other Premium */}
                  <div className="bg-white dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl p-3.5 space-y-1 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                      Tautan Undangan Google Family:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-[#5c4ade] dark:text-[#a899ff] truncate select-all">
                        {youtubeLink}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(youtubeLink, "ytLink")}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-lg transition-colors shrink-0"
                      >
                        {copiedKey === "ytLink" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-carbon dark:text-gray-200" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white/90 dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl text-center text-[11px] font-bold text-gray-700 dark:text-gray-300">
                    💡 Buka tautan undangan di atas menggunakan email Google Anda ({order.targetUserId}) untuk bergabung ke paket Premium tanpa iklan.
                  </div>
                </div>
              )}
            </div>
            )
          )}

          {/* 2. DIGITAL VOUCHER CODE BOX (For Vouchers) */}
          {order.product.categorySlug === "voucher-digital" && (
            <div className="border-2 border-carbon dark:border-[#38384a] rounded-3xl p-6 md:p-8 bg-[#ffd731]/30 dark:bg-[#ffd731]/10 text-left space-y-4 shadow-[4px_4px_0px_0px_#000000]">
              <div className="flex items-center justify-between border-b border-carbon dark:border-gray-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#fb4903] ink-border" />
                  <span className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                    Kode Voucher Digital Resmi
                  </span>
                </div>
                <span className="bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-full ink-border shadow-[1px_1px_0px_0px_#55db9c]">
                  KODE AKTIF
                </span>
              </div>

              <div className="bg-white dark:bg-[#12121a] dark:border-[#38384a] ink-border rounded-xl p-4 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]">
                <div>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                    Kode Redeem / Voucher PIN:
                  </span>
                  <span className="font-mono text-lg font-black text-carbon dark:text-white select-all tracking-wider">
                    {voucherCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(voucherCode, "voucher")}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 ink-border rounded-lg transition-colors"
                  title="Salin Kode"
                >
                  {copiedKey === "voucher" ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-carbon dark:text-gray-200" />
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold text-center">
                Salin kode di atas dan redeem langsung pada akun atau platform resmi Anda.
              </p>
            </div>
          )}

          {/* 3. GAME TOP-UP CONFIRMATION (For Game Top-Up) */}
          {order.product.categorySlug === "game-topup" && (
            <div className="border border-carbon dark:border-[#38384a] rounded-2xl p-5 bg-[#55db9c]/20 dark:bg-[#55db9c]/10 text-left space-y-3 shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-carbon dark:text-white">
                  Status Injeksi Publisher API
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-black bg-[#55db9c] px-2.5 py-0.5 rounded border border-carbon">
                  <Check className="w-3.5 h-3.5" /> SUKSES (0.3s via {order.product.developer || "Publisher"} Gateway)
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                Item <strong>{order.productItem.name}</strong> telah otomatis terinjeksi ke akun <strong>{order.targetUserId} {order.targetZoneId ? `(${order.targetZoneId})` : ""}</strong>. Silakan buka aplikasi in-game untuk memeriksa saldo Anda.
              </p>
              <div className="pt-2 border-t border-carbon/20 dark:border-gray-700 flex justify-between text-xs font-mono text-gray-600 dark:text-gray-400">
                <span>Serial Number (SN):</span>
                <span className="font-black text-carbon dark:text-white">
                  SN: {order.product.slug.toUpperCase().slice(0, 4)}-XYZ-{order.invoiceNumber.slice(-7)}
                </span>
              </div>
            </div>
          )}

          {/* Invoice Summary Receipt Card */}
          <div className="p-5 bg-[#f9f9f9] dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-2xl text-left text-xs font-bold space-y-2.5 shadow-[2px_2px_0px_0px_#000000]">
            <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Nomor Invoice:</span>
              <span className="font-black text-carbon dark:text-white">{order.invoiceNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Layanan:</span>
              <span className="font-black text-carbon dark:text-white">{order.product.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Item:</span>
              <span className="font-black text-carbon dark:text-white">{order.productItem.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Target ID:</span>
              <span className="font-black text-carbon dark:text-white">
                {order.targetUserId} {order.targetZoneId ? `(${order.targetZoneId})` : ""}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Email Pembeli:</span>
              <span className="font-black text-carbon dark:text-white">{order.customerEmail}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400">Total Pembayaran:</span>
              <span className="font-black text-carbon dark:text-white">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-8 py-3 bg-[#ffd731] text-black rounded-full ink-border font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:scale-[1.02] transition-transform"
            >
              Beli Produk Lain
            </Link>

            <Link
              href="/cek-transaksi"
              className="px-6 py-3 bg-white dark:bg-[#20202e] text-carbon dark:text-white rounded-full ink-border font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Lacak Pesanan
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: QR Card & Steps (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#000000]">
              
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-carbon dark:border-gray-700 pb-3 mb-6 text-center sm:text-left">
                <span className="text-xs font-black uppercase text-carbon dark:text-white">
                  Scan QRIS Menggunakan M-Banking / E-Wallet
                </span>
                <span className="bg-[#e9e9e9] dark:bg-[#252536] dark:border-gray-700 ink-border px-2.5 py-0.5 rounded-full text-[10px] font-black text-carbon dark:text-gray-200 uppercase shrink-0">
                  NMID: ID102000000000
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-5 bg-white !bg-white ink-border rounded-2xl shadow-[3px_3px_0px_0px_#000000] qr-canvas">
                {order.qrisString ? (
                  <QRCodeSVG
                    value={order.qrisString}
                    size={240}
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-60 h-60 bg-gray-100 flex items-center justify-center text-xs font-bold text-black">
                    Memuat QRIS...
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#55db9c] ink-border animate-ping" />
                <span className="text-xs font-black text-carbon dark:text-white uppercase">
                  Menunggu Notifikasi Otomatis Gateway...
                </span>
              </div>

              {/* Supported Payment Logos / Names */}
              <div className="mt-6 pt-4 border-t border-carbon/20 dark:border-gray-700 w-full text-center">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Mendukung Seluruh Saluran Pembayaran
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {["BCA", "MANDIRI", "BRI", "BNI", "GOPAY", "DANA", "SHOPEEPAY", "OVO", "LINKAJA"].map(
                    (app) => (
                      <span
                        key={app}
                        className="px-2 py-0.5 bg-[#f3f4f6] dark:bg-[#252536] dark:border-gray-700 ink-border rounded text-[10px] font-black text-carbon dark:text-gray-200"
                      >
                        {app}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Amount Alert & Receipt Breakdown (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* EXACT AMOUNT ALERT (Sunburst yellow box) */}
            <div className="p-6 bg-[#ffd731] ink-border rounded-2xl shadow-[4px_4px_0px_0px_#000000] text-center space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                TOTAL TRANSFER WAJIB TEPAT
              </span>

              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-black font-[var(--font-bricolage)]">
                  Rp {order.totalAmount.toLocaleString("id-ID")}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="px-3 py-1.5 bg-white text-black ink-border rounded-xl text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] hover:bg-gray-50"
                >
                  {copiedAmount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-black" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 bg-white/90 ink-border rounded-xl text-[11px] font-bold text-black text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#fb4903] shrink-0 mt-0.5" />
                <span>
                  Nominal mencakup <strong>kode unik Rp {order.uniqueCode}</strong>. Jangan kurangi atau bulatkan agar pesanan langsung masuk otomatis.
                </span>
              </div>
            </div>

            {/* Order Details Breakdown */}
            <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000000] space-y-3 text-xs font-bold">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Layanan:</span>
                <span className="font-black text-carbon dark:text-white">{order.product.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Item:</span>
                <span className="font-black text-carbon dark:text-white">{order.productItem.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Tujuan:</span>
                <span className="font-black text-carbon dark:text-white">
                  {order.targetUserId} {order.targetZoneId ? `(${order.targetZoneId})` : ""}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Harga Item:</span>
                <span className="font-black text-carbon dark:text-white">Rp {order.basePrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Kode Unik:</span>
                <span className="font-black text-[#5c4ade] dark:text-[#9e8dff]">+ Rp {order.uniqueCode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 dark:text-gray-400">Biaya Admin:</span>
                <span className="font-black text-green-600 dark:text-green-400">Rp 0 (GRATIS)</span>
              </div>
            </div>

            {/* REAL-TIME PAYMENT VERIFICATION & STATUS CHECK */}
            <div className="p-4 bg-[#f8fafc] dark:bg-[#152338] dark:border-[#2d3f5e] ink-border rounded-2xl shadow-[3px_3px_0px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-carbon dark:text-white">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#55db9c]" />
                  <span>Verifikasi Pembayaran Otomatis</span>
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Auto-cek aktif
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                Setelah scan dan transfer QRIS berhasil, sistem akan mendeteksi mutasi dan mengubah status pesanan secara instan.
              </p>
              <button
                type="button"
                onClick={handleManualCheckStatus}
                disabled={isChecking}
                className="w-full py-3 bg-[#ffd731] hover:bg-[#ffe05c] text-black rounded-xl ink-border font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RotateCw className={`w-4 h-4 text-black ${isChecking ? "animate-spin" : ""}`} />
                <span>{isChecking ? "Mengecek Pembayaran..." : "Cek Status Pembayaran"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
