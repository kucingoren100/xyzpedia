"use client";

import { ShieldCheck, AlertTriangle, Lock, Zap, MessageCircle, CheckCircle2 } from "lucide-react";

export default function SecurityTrustBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-[#ffd731]/15 dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl p-4 shadow-[3px_3px_0px_#000000] space-y-2.5">
        <div className="flex items-center gap-2 text-carbon dark:text-white">
          <span className="p-1.5 bg-[#ffd731] text-black rounded-lg ink-border">
            <AlertTriangle className="w-4 h-4 fill-current stroke-black" />
          </span>
          <span className="font-[var(--font-bricolage)] font-black text-xs uppercase tracking-wide">
            Jaminan Keamanan & Anti-Penipuan
          </span>
        </div>
        <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
          XYZPEDIA <strong>tidak pernah meminta password atau kode OTP</strong>. Pembayaran hanya sah via QRIS resmi di website ini. Garansi 100% uang kembali jika pesanan gagal.
        </p>
      </div>
    );
  }

  return (
    <section className="w-full bg-white dark:bg-[#161622] ink-border-thick dark:border-[#38384a] rounded-3xl p-5 sm:p-7 shadow-[5px_5px_0px_#000000] space-y-5">
      {/* Top Banner Alert Bar */}
      <div className="bg-[#ff4d4d] text-white ink-border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#ffd731] text-black rounded-xl ink-border shrink-0 shadow-[1px_1px_0px_#000000]">
            <AlertTriangle className="w-5 h-5 fill-current stroke-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-black text-[#ffd731] text-[10px] font-black uppercase rounded ink-border tracking-wider">
                HIMBAUAN KEAMANAN RESMI
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                WASPADA PENIPUAN
              </span>
            </div>
            <p className="text-xs sm:text-[13px] font-bold text-white/95 mt-1 leading-snug">
              XYZPEDIA <strong>TIDAK PERNAH</strong> meminta password akun, kode OTP, ataupun transfer manual ke rekening pribadi. Seluruh pembayaran resmi hanya melalui QRIS otomatis di website ini!
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/6281234567890?text=Halo%20Admin%20XYZPEDIA,%20saya%20ingin%20konfirmasi%20keamanan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ffd731] hover:bg-[#ffe266] text-black text-xs font-black uppercase rounded-xl ink-border shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-black" />
          <span>CS WhatsApp Resmi</span>
        </a>
      </div>

      {/* 3 Pillars of Security Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Garansi 100% */}
        <div className="bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 text-[#16a34a] dark:text-[#4ade80] ink-border dark:border-[#38384a] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h4 className="font-[var(--font-bricolage)] font-black text-sm uppercase text-carbon dark:text-white">
            Garansi Penuh 100%
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            Jika pesanan gagal terkirim karena server publisher gangguan, kami memberikan jaminan <strong>penggantian instan atau refund saldo penuh</strong> tanpa potongan.
          </p>
        </div>

        {/* Pillar 2: Direct API Gateway */}
        <div className="bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
          <div className="w-9 h-9 rounded-xl bg-[#ffd731]/30 text-carbon dark:text-[#ffd731] ink-border dark:border-[#38384a] flex items-center justify-center">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h4 className="font-[var(--font-bricolage)] font-black text-sm uppercase text-carbon dark:text-white">
            Jalur API Resmi & Otomatis
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            Injeksi diamond dan voucher terhubung langsung ke API resmi publisher. Sistem bekerja <strong>24 jam nonstop</strong> dengan rata-rata proses 1 hingga 5 detik.
          </p>
        </div>

        {/* Pillar 3: QRIS Dinamis Enkripsi */}
        <div className="bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl p-4 space-y-2 shadow-[2px_2px_0px_#000000]">
          <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/20 text-[#2563eb] dark:text-[#60a5fa] ink-border dark:border-[#38384a] flex items-center justify-center">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h4 className="font-[var(--font-bricolage)] font-black text-sm uppercase text-carbon dark:text-white">
            QRIS Dinamis Terverifikasi
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            Didukung standard QRIS Nasional berizin Bank Indonesia. Pembayaran diverifikasi instan secara otomatis tanpa perlu kirim bukti transfer manual.
          </p>
        </div>
      </div>
    </section>
  );
}
