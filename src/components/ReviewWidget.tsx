"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2, MessageSquare } from "lucide-react";

interface ReviewWidgetProps {
  invoiceNumber: string;
  productName: string;
  defaultName?: string;
}

export default function ReviewWidget({ invoiceNumber, productName, defaultName }: ReviewWidgetProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(defaultName || "");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          rating,
          customerName: name || undefined,
          comment: comment || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Gagal mengirim ulasan.");
      }
    } catch (err: any) {
      setErrorMsg("Koneksi gagal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="no-print mt-6 max-w-[620px] w-full bg-[#55db9c]/15 border-2 border-[#55db9c] p-6 rounded-2xl ink-border text-center space-y-2 shadow-[3px_3px_0px_#000]">
        <div className="w-10 h-10 rounded-full bg-[#55db9c] ink-border flex items-center justify-center mx-auto shadow-[1.5px_1.5px_0px_#000]">
          <CheckCircle2 className="w-5 h-5 text-black" />
        </div>
        <h4 className="font-[var(--font-bricolage)] text-sm font-black uppercase text-carbon dark:text-white">
          Terima Kasih Atas Ulasan Anda!
        </h4>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          Ulasan {rating} bintang Anda untuk {productName} telah berhasil diverifikasi dan tersimpan di sistem.
        </p>
      </div>
    );
  }

  return (
    <div className="no-print mt-6 max-w-[620px] w-full bg-white dark:bg-[#181824] ink-border rounded-2xl p-5 shadow-[4px_4px_0px_#000] space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <MessageSquare className="w-4 h-4 text-[#ffd731]" />
        <h4 className="font-[var(--font-bricolage)] text-xs sm:text-sm font-black uppercase text-carbon dark:text-white">
          Beri Penilaian & Ulasan Layanan
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Star Rating Selector */}
        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
            Kepuasan Transaksi:
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    (hoverRating || rating) >= star
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-black text-carbon dark:text-white">
              {rating === 5
                ? "⭐⭐⭐⭐⭐ Sangat Puas"
                : rating === 4
                ? "⭐⭐⭐⭐ Puas"
                : rating === 3
                ? "⭐⭐⭐ Cukup"
                : "⭐⭐ Kurang"}
            </span>
          </div>
        </div>

        {/* Input Name & Comment */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama / Inisial Anda"
            className="px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
          />

          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis ulasan Anda (misal: Proses kilat 1 detik!)..."
            className="sm:col-span-2 px-3 py-2 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-red-600 dark:text-red-400 font-bold">
            ⚠ {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-[#ffd731] hover:bg-[#ffe366] text-black font-black text-xs uppercase tracking-wider rounded-xl ink-border shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? "Mengirim..." : "Kirim Ulasan Pembeli"}</span>
        </button>
      </form>
    </div>
  );
}
