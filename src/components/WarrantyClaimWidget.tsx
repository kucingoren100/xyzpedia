"use client";

import { useState, useEffect } from "react";
import { getWhatsAppUrl } from "@/lib/contact";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  X,
  FileText,
  Send,
  HelpCircle,
} from "lucide-react";

interface WarrantyClaim {
  id: string;
  invoiceNumber: string;
  customerPhone: string;
  customerEmail?: string | null;
  issueType: string;
  description: string;
  proofImageUrl?: string | null;
  status: "PENDING" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  adminNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

interface WarrantyClaimWidgetProps {
  invoiceNumber: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  productName: string;
}

const ISSUE_OPTIONS = [
  { id: "ITEM_BELUM_MASUK", label: "💎 Diamond / Item Belum Masuk" },
  { id: "AKUN_LOGIN_GAGAL", label: "🔑 Kendala Kredensial / Akses Akun Bermasalah" },
  { id: "RESET_PROFIL", label: "🔄 Profil / Masa Aktif Berkurang" },
  { id: "SALAH_NOMINAL", label: "💳 Kendala Pembayaran / Saldo Terpotong" },
  { id: "LAINNYA", label: "❓ Kendala Lainnya" },
];

export default function WarrantyClaimWidget({
  invoiceNumber,
  customerPhone,
  customerEmail,
  productName,
}: WarrantyClaimWidgetProps) {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State - avoid pre-filling masked phone numbers with asterisks (e.g. 081****890)
  const initialPhone = customerPhone && !customerPhone.includes("*") ? customerPhone : "";
  const [phone, setPhone] = useState(initialPhone);
  const [issueType, setIssueType] = useState("ITEM_BELUM_MASUK");
  const [description, setDescription] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchClaims = async () => {
    try {
      const res = await fetch(`/api/warranty-claims?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.claims)) {
        setClaims(data.claims);
      }
    } catch (err) {
      console.error("Gagal mengambil status klaim garansi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [invoiceNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!phone.trim() || phone.includes("*") || phone.replace(/\D/g, "").length < 8) {
      setErrorMessage("Nomor WhatsApp aktif wajib diisi lengkap (bukan nomor tersensor) agar kami bisa mengirim solusi.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Mohon berikan penjelasan kendala Anda secara lengkap (minimal 10 karakter).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/warranty-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          customerPhone: phone.trim(),
          customerEmail: customerEmail || undefined,
          issueType,
          description: description.trim(),
          proofImageUrl: proofUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage("Klaim garansi berhasil dikirim! Tim support kami segera memeriksanya.");
        setDescription("");
        setProofUrl("");
        await fetchClaims();
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMessage("");
        }, 1500);
      } else {
        setErrorMessage(data.error || "Gagal mengirim tiket garansi. Silakan coba kembali.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi. Silakan periksa jaringan Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestClaim = claims[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="px-2.5 py-1 bg-[#22c55e] text-white font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
            <span>SELESAI DIGARANSI</span>
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="px-2.5 py-1 bg-[#3b82f6] text-white font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <Clock className="w-3 h-3 animate-spin" />
            <span>SEDANG DIPERIKSA</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 bg-[#ef4444] text-white font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <XCircle className="w-3 h-3 stroke-[3]" />
            <span>KLAIM DITOLAK</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-[#ffd731] text-black font-black text-[10px] rounded-full ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
            <Clock className="w-3 h-3" />
            <span>MENUNGGU ANTRIAN</span>
          </span>
        );
    }
  };

  const getIssueLabel = (key: string) => {
    return ISSUE_OPTIONS.find((o) => o.id === key)?.label || key;
  };

  return (
    <div className="w-full max-w-[480px] mx-auto mt-4 no-print">
      {/* Main Widget Card */}
      <div className="bg-white dark:bg-[#161622] ink-border rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-carbon dark:border-[#38384a]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#22c55e] text-white rounded-lg ink-border">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase text-[#16a34a] dark:text-[#4ade80] block leading-none">
                Jaminan 100% Bergaransi
              </span>
              <h4 className="font-[var(--font-bricolage)] font-black text-sm uppercase text-carbon dark:text-white leading-tight">
                Pusat Bantuan & Komplain
              </h4>
            </div>
          </div>

          {latestClaim && getStatusBadge(latestClaim.status)}
        </div>

        {/* Existing Claim Details or Intro */}
        {latestClaim ? (
          <div className="bg-[#f8fafc] dark:bg-[#1a1a2e] ink-border dark:border-[#38384a] rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
              <span>ID Tiket: #{latestClaim.id.slice(-6).toUpperCase()}</span>
              <span>
                {new Date(latestClaim.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 block">Kategori Kendala:</span>
              <p className="font-extrabold text-carbon dark:text-white">{getIssueLabel(latestClaim.issueType)}</p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 block">Keterangan Anda:</span>
              <p className="font-medium text-gray-700 dark:text-gray-300 italic bg-white dark:bg-[#12121a] p-2 rounded-lg border border-gray-200 dark:border-gray-800">
                &ldquo;{latestClaim.description}&rdquo;
              </p>
            </div>

            {/* Admin Response Note */}
            {latestClaim.adminNotes && (
              <div className="p-2.5 bg-[#ffd731]/20 border-2 border-[#eab308] rounded-xl space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-200 block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                  <span>Tanggapan Tim Support XYZPEDIA:</span>
                </span>
                <p className="text-xs font-bold text-amber-950 dark:text-amber-100 leading-snug">
                  {latestClaim.adminNotes}
                </p>
              </div>
            )}

            {/* WhatsApp Direct Escalation Button */}
            <a
              href={getWhatsAppUrl(
                `Halo Tim Support XYZPEDIA, saya ingin konfirmasi tiket garansi #${latestClaim.id
                  .slice(-6)
                  .toUpperCase()} untuk pesanan ${productName} (Invoice: ${invoiceNumber}).`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-black uppercase rounded-xl ink-border flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>Hubungi CS WhatsApp Terkait Tiket Ini</span>
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
              Jika pesanan Anda mengalami kendala seperti diamond belum masuk atau akun streaming tidak bisa login, Anda berhak mendapatkan garansi replace / refund 100%.
            </p>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 px-4 bg-[#ffd731] hover:bg-[#ffe266] text-black font-[var(--font-bricolage)] text-xs font-black uppercase rounded-xl ink-border shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Ajukan Klaim Garansi / Bantuan</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Form Pengajuan Garansi */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#161622] rounded-3xl ink-border-thick dark:border-[#38384a] p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000] max-h-[92vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-carbon dark:border-[#38384a]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#16a34a] bg-[#22c55e]/15 px-2 py-0.5 rounded ink-border inline-block">
                  PROTEKSI GARANSI RESMI
                </span>
                <h3 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white leading-tight mt-1">
                  Formulir Klaim Garansi
                </h3>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#252538] hover:bg-[#ffdad6] ink-border dark:border-[#38384a] flex items-center justify-center text-carbon dark:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-[#1f1f2e] rounded-xl ink-border dark:border-[#38384a] flex justify-between items-center font-bold">
                <span className="text-gray-500">Nomor Invoice:</span>
                <span className="font-mono font-black text-carbon dark:text-white">{invoiceNumber}</span>
              </div>

              {/* Issue Type Selector */}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-gray-700 dark:text-gray-300 text-[11px] block">
                  Pilih Jenis Kendala:
                </label>
                <div className="space-y-1.5">
                  {ISSUE_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl ink-border cursor-pointer transition-all ${
                        issueType === opt.id
                          ? "bg-[#ffd731] text-black font-black shadow-[2px_2px_0px_#000]"
                          : "bg-white dark:bg-[#1f1f2e] text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueType"
                        value={opt.id}
                        checked={issueType === opt.id}
                        onChange={(e) => setIssueType(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* WhatsApp Contact */}
              <div className="space-y-1">
                <label className="font-black uppercase text-gray-700 dark:text-gray-300 text-[11px] block">
                  Nomor WhatsApp Aktif:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl text-carbon dark:text-white font-bold outline-none focus:ring-2 focus:ring-[#ffd731]"
                />
                <span className="text-[10px] text-gray-500 block">
                  Kami akan menghubungi nomor ini untuk menyampaikan kredensial pengganti atau solusi.
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-black uppercase text-gray-700 dark:text-gray-300 text-[11px] block">
                  Jelaskan Kendala Secara Lengkap:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Saya sudah bayar 30 menit lalu tapi diamond belum bertambah di akun, atau akses akun mengalami kendala..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl text-carbon dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#ffd731]"
                />
              </div>

              {/* Optional Proof Link */}
              <div className="space-y-1">
                <label className="font-black uppercase text-gray-700 dark:text-gray-300 text-[11px] block">
                  Link Bukti Screenshot / Catatan Tambahan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: https://i.imgur.com/... atau catatan pendukung"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl text-carbon dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#ffd731]"
                />
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="p-3 bg-[#ffdad6] dark:bg-[#3d141a] ink-border dark:border-[#5c1d28] rounded-xl text-xs font-black text-[#93000a] dark:text-[#fca5a5] animate-in fade-in">
                  ⚠️ {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-[#c8f285] dark:bg-[#1e3a1e] ink-border rounded-xl text-xs font-black text-black dark:text-[#a7f3d0] animate-in fade-in">
                  ✅ {successMessage}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl ink-border bg-gray-100 hover:bg-gray-200 dark:bg-[#252535] dark:hover:bg-[#2d2d40] text-carbon dark:text-white font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 text-center"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl ink-border bg-[#ffd731] hover:bg-[#ffe266] text-black font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-center"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Kirim Klaim</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
