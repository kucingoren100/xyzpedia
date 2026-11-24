"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { checkPaymentStatus } from "@/app/actions/order";
import { parseSupplierDelivery } from "@/lib/deliveryHelper";
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  RotateCw,
  Download,
  ShieldCheck,
  ExternalLink,
  XCircle,
  Key,
} from "lucide-react";
import Link from "next/link";
import ReviewWidget from "@/components/ReviewWidget";

interface SafeOrder {
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
  sn?: string | null;
  supplierStatus?: string | null;
  notes?: string | null;
}

export default function TransactionViewClient({ initialOrder }: { initialOrder: SafeOrder }) {
  const [order, setOrder] = useState<SafeOrder>(initialOrder);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const getRemainingSeconds = () => {
    if (!initialOrder?.createdAt) return 15 * 60;
    const createdAtTime = new Date(initialOrder.createdAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAtTime) / 1000));
    return Math.max(0, 15 * 60 - elapsedSeconds);
  };

  const [timeLeft, setTimeLeft] = useState(getRemainingSeconds);

  // Auto-poll status when order is PENDING (waiting payment) or PROCESSING (waiting supplier fulfillment)
  useEffect(() => {
    if (order.status !== "PENDING" && order.status !== "PROCESSING") return;

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(async () => {
      if (!isVisible) return;
      try {
        const res = await checkPaymentStatus(order.invoiceNumber);
        if (res.success && res.order) {
          setOrder((prev) => ({
            ...prev,
            status: res.order!.status,
            paidAt: res.order!.paidAt,
            sn: (res.order as any).sn || prev.sn,
            supplierStatus: (res.order as any).supplierStatus || prev.supplierStatus,
          }));
        }
      } catch {
        // Silent error
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [order.invoiceNumber, order.status]);

  // Countdown timer for pending order
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

  const handleManualCheckStatus = async () => {
    setIsChecking(true);
    try {
      const res = await checkPaymentStatus(order.invoiceNumber);
      if (res.success) {
        if (res.isPaid && res.order) {
          setOrder((prev) => ({
            ...prev,
            status: res.order!.status,
            paidAt: res.order!.paidAt,
            sn: (res.order as any).sn || prev.sn,
            supplierStatus: (res.order as any).supplierStatus || prev.supplierStatus,
          }));
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

  // Extract structured SN: check structured field first, fallback to parsing notes
  const parsedDelivery = parseSupplierDelivery(order.notes);
  const effectiveSn = order.sn || parsedDelivery.sn;

  const isPending = order.status === "PENDING" && timeLeft > 0;
  const isPaidOrProcessing = order.status === "PAID" || order.status === "PROCESSING";
  const isSuccess = order.status === "SUCCESS";
  const isFailed = order.status === "FAILED";
  const isExpiredOrCancelled =
    order.status === "EXPIRED" ||
    order.status === "CANCELLED" ||
    (order.status === "PENDING" && timeLeft <= 0);

  const isAkunPremium = order.product.categorySlug === "akun-premium";

  const waAdminNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890";
  const waOrderText = `Halo Admin XYZPEDIA, saya ingin konfirmasi pesanan:
📌 No. Invoice: ${order.invoiceNumber}
📦 Produk: ${order.product.name}
💎 Varian: ${order.productItem.name}
💰 Total: Rp ${order.totalAmount.toLocaleString("id-ID")}
Status: ${order.status}`;

  const waOrderUrl = `https://wa.me/${waAdminNumber}?text=${encodeURIComponent(waOrderText)}`;

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
              ✓ TRANSAKSI SUKSES
            </span>
          ) : isPaidOrProcessing ? (
            <span className="px-3 py-1 bg-[#38bdf8] text-black ink-border rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000]">
              ⚙️ SEDANG DIPROSES
            </span>
          ) : isFailed ? (
            <span className="px-3 py-1 bg-[#f87171] text-black ink-border rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000]">
              ⚠️ KENDALA SISTEM
            </span>
          ) : isExpiredOrCancelled ? (
            <span className="px-3 py-1 bg-gray-400 text-white ink-border rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000]">
              ✕ KEDALUWARSA
            </span>
          ) : (
            <span className="px-3 py-1 bg-[#ffd731] text-black ink-border rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000] animate-pulse">
              ⏳ MENUNGGU PEMBAYARAN
            </span>
          )}
        </div>
      </div>

      {/* HEADER SUMMARY BANNER */}
      <div className="relative w-full bg-white dark:bg-[#161622] rounded-3xl ink-border dark:border-[#38384a] p-6 md:p-8 overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#ffd731] text-black font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full ink-border">
                {isSuccess
                  ? "TRANSAKSI SELESAI"
                  : isPaidOrProcessing
                  ? "PEMBAYARAN DITERIMA"
                  : isFailed
                  ? "PERLU BANTUAN"
                  : isExpiredOrCancelled
                  ? "STATUS KEDALUWARSA"
                  : "MENUNGGU QRIS"}
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
              {isSuccess
                ? "Pesanan Berhasil Diselesaikan"
                : isPaidOrProcessing
                ? "Pembayaran Diterima, Pesanan Sedang Diproses"
                : isFailed
                ? "Pesanan Mengalami Kendala Supplier"
                : isExpiredOrCancelled
                ? "Pesanan Telah Kedaluwarsa"
                : "Menunggu Pembayaran QRIS"}
            </h1>

            <p className="text-xs font-bold text-gray-600 dark:text-gray-300 max-w-xl">
              Pesanan untuk{" "}
              <span className="text-carbon dark:text-white font-black">
                {order.product.name} ({order.productItem.name})
              </span>
              . Bukti transaksi resmi dikirim otomatis ke{" "}
              <span className="text-carbon dark:text-white font-black">{order.customerEmail}</span>.
            </p>
          </div>

          {/* Countdown timer for PENDING only */}
          {isPending && (
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

      {/* VIEW CONDITIONS */}

      {/* 1. SUCCESS VIEW */}
      {isSuccess && (
        <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-10 text-center space-y-6 shadow-[4px_4px_0px_0px_#000000] max-w-4xl mx-auto">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <img
              src="/brand/ekspresi/xyzi-rayakan.svg"
              alt="XYZI Merayakan Sukses"
              className="w-full h-full object-contain drop-shadow-md animate-bounce"
              style={{ animationDuration: "2s" }}
            />
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#55db9c] ink-border flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
              <CheckCircle2 className="w-5 h-5 text-black" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="font-[var(--font-bricolage)] text-xl md:text-2xl font-black uppercase text-carbon dark:text-white">
              Transaksi Berhasil
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              Pembayaran telah terverifikasi secara resmi oleh sistem. Item Anda telah siap.
            </p>
          </div>

          {/* 1A. Kredensial Langsung (Akun Premium / Voucher / Serial Number) */}
          {effectiveSn ? (
            <div className="border-2 border-carbon dark:border-[#38384a] rounded-3xl p-6 bg-[#dcfce7] dark:bg-[#12241a] text-left space-y-4 shadow-[4px_4px_0px_0px_#000000]">
              <div className="flex items-center justify-between border-b border-carbon/20 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <h3 className="font-[var(--font-bricolage)] text-base font-black uppercase text-carbon dark:text-white">
                    {isAkunPremium
                      ? "Kredensial & Akses Akun"
                      : order.product.categorySlug === "voucher-digital"
                      ? "Kode Voucher / Serial Number"
                      : "Serial Number Supplier"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(effectiveSn, "sn")}
                  className="px-3 py-1.5 bg-white dark:bg-[#1a1a28] hover:bg-gray-100 dark:hover:bg-[#252538] rounded-xl ink-border text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
                >
                  {copiedKey === "sn" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Semua</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white dark:bg-[#0b131a] p-4 rounded-2xl ink-border shadow-inner">
                <pre className="font-mono text-xs sm:text-sm font-black text-carbon dark:text-emerald-300 whitespace-pre-wrap break-words select-all leading-relaxed">
                  {effectiveSn}
                </pre>
              </div>

              <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                {isAkunPremium
                  ? "✓ Kredensial resmi telah terbit otomatis. Silakan gunakan data login di atas untuk masuk ke aplikasi."
                  : "✓ Simpan bukti kode / Serial Number resmi di atas untuk keperluan transaksi."}
              </p>
            </div>
          ) : isAkunPremium ? (
            /* 1B. Akun Premium Manual Fallback (Jika stok supplier kosong / manual) */
            <div className="border-2 border-carbon dark:border-[#38384a] rounded-3xl p-6 bg-[#fff3d4] dark:bg-[#201d14] text-left space-y-4 shadow-[3px_3px_0px_0px_#000000]">
              <div className="flex items-center gap-2 border-b border-carbon/20 pb-3">
                <Clock className="w-5 h-5 text-black" />
                <h3 className="font-[var(--font-bricolage)] text-base font-black uppercase text-carbon dark:text-white">
                  Penyerahan Akun Premium
                </h3>
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Kredensial dan akses akun diserahkan langsung oleh Admin XYZPEDIA melalui WhatsApp resmi untuk menjamin privasi dan keamanan slot akun Anda.
              </p>
              <a
                href={waOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black py-3.5 px-6 rounded-2xl ink-border text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000000] transition-all text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Hubungi Admin di WhatsApp</span>
              </a>
            </div>
          ) : null}

          {/* Customer Review & Rating Widget directly on Success */}
          <div className="pt-2 w-full flex justify-center">
            <ReviewWidget
              invoiceNumber={order.invoiceNumber}
              productName={order.product.name}
              defaultName={order.customerEmail ? order.customerEmail.split("@")[0] : ""}
            />
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#ffd731] text-black rounded-full ink-border font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]"
            >
              Beli Produk Lain
            </Link>
            <Link
              href={`/struk/${order.invoiceNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-[#16a34a] text-white rounded-full ink-border font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Struk
            </Link>
          </div>
        </div>
      )}

      {/* 2. PAID / PROCESSING VIEW */}
      {isPaidOrProcessing && (
        <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-10 text-center space-y-6 shadow-[4px_4px_0px_0px_#000000] max-w-4xl mx-auto">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <img
              src="/brand/ekspresi/xyzi-berpikir.svg"
              alt="XYZI Sedang Memproses"
              className="w-full h-full object-contain drop-shadow-md animate-pulse"
              style={{ animationDuration: "1.5s" }}
            />
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#38bdf8] ink-border flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
              <Clock className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="font-[var(--font-bricolage)] text-xl md:text-2xl font-black uppercase text-carbon dark:text-white">
              Pembayaran Diterima
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              Pembayaran berhasil diverifikasi. Pesanan Anda saat ini sedang diproses ke supplier resmi. Halaman ini akan diperbarui secara otomatis.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
            <span>Sinkronisasi otomatis dengan server supplier...</span>
          </div>

          <div className="p-4 bg-[#f0f9ff] dark:bg-[#152338] ink-border rounded-2xl text-left text-xs font-semibold space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Nomor Invoice:</span>
              <span className="font-mono font-bold">{order.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Produk:</span>
              <span className="font-bold">{order.product.name} ({order.productItem.name})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status Supplier:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                {order.supplierStatus || "Diproses"}
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleManualCheckStatus}
              disabled={isChecking}
              className="px-6 py-2.5 bg-[#ffd731] hover:bg-[#ffe160] text-black rounded-full ink-border font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000] inline-flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
              <span>{isChecking ? "Mengecek Supplier..." : "Cek Status Terkini"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. FAILED VIEW */}
      {isFailed && (
        <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-10 text-center space-y-6 shadow-[4px_4px_0px_0px_#000000] max-w-4xl mx-auto">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <img
              src="/brand/ekspresi/xyzi-maaf.svg"
              alt="XYZI Mohon Maaf"
              className="w-full h-full object-contain drop-shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#f87171] ink-border flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
              <AlertTriangle className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="font-[var(--font-bricolage)] text-xl md:text-2xl font-black uppercase text-carbon dark:text-white">
              Kendala Proses Pesanan
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              Pembayaran Anda aman. Provider resmi sedang mengalami kendala sementara saat memproses item. Silakan hubungi Customer Service kami untuk bantuan instan atau pengembalian dana.
            </p>
          </div>
          <a
            href={waOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-black px-6 py-3 rounded-2xl ink-border text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Bantuan Admin di WhatsApp</span>
          </a>
        </div>
      )}

      {/* 4. EXPIRED OR CANCELLED VIEW */}
      {isExpiredOrCancelled && (
        <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-10 text-center space-y-6 shadow-[4px_4px_0px_0px_#000000] max-w-4xl mx-auto">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <img
              src="/brand/ekspresi/xyzi-tidur.svg"
              alt="XYZI Sedang Istirahat"
              className="w-full h-full object-contain drop-shadow-md opacity-80"
            />
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gray-300 ink-border flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
              <XCircle className="w-5 h-5 text-black" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="font-[var(--font-bricolage)] text-xl md:text-2xl font-black uppercase text-carbon dark:text-white">
              Pesanan Telah Kedaluwarsa
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
              Waktu pembayaran untuk invoice ini telah habis. Silakan buat pesanan baru untuk mendapatkan kode QRIS terbaru.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-[#ffd731] text-black rounded-full ink-border font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]"
          >
            Buat Pesanan Baru
          </Link>
        </div>
      )}

      {/* 5. PENDING VIEW (QRIS DISPLAY) */}
      {isPending && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: QR Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-[4px_4px_0px_0px_#000000]">
              <div className="w-full flex items-center justify-between border-b border-carbon dark:border-gray-700 pb-3 mb-6">
                <span className="text-xs font-black uppercase text-carbon dark:text-white">
                  Scan QRIS Menggunakan M-Banking / E-Wallet
                </span>
                <span className="bg-[#e9e9e9] dark:bg-[#252536] ink-border px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  QRIS DINAMIS
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-5 bg-white !bg-white ink-border rounded-2xl shadow-[3px_3px_0px_0px_#000000]">
                {order.qrisString ? (
                  <QRCodeSVG value={order.qrisString} size={240} level="M" includeMargin={false} />
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
            </div>
          </div>

          {/* Right Column: Amount Alert & Receipt Breakdown */}
          <div className="lg:col-span-5 space-y-4">
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
                  {copiedAmount ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                  <span>{copiedAmount ? "Tersalin" : "Salin"}</span>
                </button>
              </div>

              <div className="p-2.5 bg-white/90 ink-border rounded-xl text-[11px] font-bold text-black text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#fb4903] shrink-0 mt-0.5" />
                <span>
                  Nominal mencakup <strong>kode unik Rp {order.uniqueCode}</strong>. Jangan kurangi atau bulatkan.
                </span>
              </div>
            </div>

            {/* Order Details Breakdown */}
            <div className="bg-white dark:bg-[#181824] dark:border-[#38384a] ink-border rounded-2xl p-5 shadow-[3px_3px_0px_0px_#000000] space-y-3 text-xs font-bold">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Layanan:</span>
                <span className="font-black">{order.product.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Item:</span>
                <span className="font-black">{order.productItem.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Tujuan:</span>
                <span className="font-black">
                  {order.targetUserId} {order.targetZoneId ? `(${order.targetZoneId})` : ""}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Harga Item:</span>
                <span className="font-black">Rp {order.basePrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Kode Unik:</span>
                <span className="font-black text-[#5c4ade]">+ Rp {order.uniqueCode}</span>
              </div>
            </div>

            {/* Check Payment Button */}
            <div className="p-4 bg-[#f8fafc] dark:bg-[#152338] ink-border rounded-2xl shadow-[3px_3px_0px_0px_#000000] space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#55db9c]" />
                  <span>Verifikasi Pembayaran Otomatis</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleManualCheckStatus}
                disabled={isChecking}
                className="w-full py-3 bg-[#ffd731] hover:bg-[#ffe05c] text-black rounded-xl ink-border font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
