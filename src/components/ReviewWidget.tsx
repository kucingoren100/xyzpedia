"use client";

import { useState, useEffect } from "react";
import { Star, Send, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";

interface ReviewWidgetProps {
  invoiceNumber: string;
  productName: string;
  defaultName?: string;
  className?: string;
}

const QUICK_TAGS = [
  "⚡ Proses kilat!",
  "💎 Kredensial langsung aktif",
  "💯 Murah & terpercaya",
  "⭐ Recommended seller!",
];

export default function ReviewWidget({
  invoiceNumber,
  productName,
  defaultName,
  className = "",
}: ReviewWidgetProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState(defaultName || "");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState<{
    rating: number;
    customerName: string;
    comment: string | null;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if review already exists for this invoice
  useEffect(() => {
    let active = true;
    async function checkReview() {
      try {
        const res = await fetch(`/api/reviews?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.hasReviewed && data.review) {
            setExistingReview(data.review);
            setRating(data.review.rating);
            setSubmitted(true);
          }
        }
      } catch {
        // silent fail on network check
      }
    }
    if (invoiceNumber) {
      checkReview();
    }
    return () => {
      active = false;
    };
  }, [invoiceNumber]);

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
        setExistingReview({
          rating,
          customerName: name || "Kawan XYZ",
          comment: comment || "Pelayanan sangat memuaskan, proses cepat!",
        });
      } else {
        setErrorMsg(data.error || "Gagal mengirim ulasan.");
      }
    } catch (err: any) {
      setErrorMsg("Koneksi gagal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectQuickTag = (tag: string) => {
    if (!comment) {
      setComment(tag);
    } else if (!comment.includes(tag)) {
      setComment((prev) => `${prev} ${tag}`);
    }
  };

  if (submitted) {
    return (
      <div
        className={`no-print max-w-full w-full bg-[#dcfce7] dark:bg-[#12241a] border-2 border-carbon dark:border-[#38384a] p-5 sm:p-6 rounded-3xl ink-border text-left shadow-[4px_4px_0px_0px_#000000] space-y-3 ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#55db9c] ink-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000000]">
              <CheckCircle2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h4 className="font-[var(--font-bricolage)] text-sm sm:text-base font-black uppercase text-carbon dark:text-white">
                Ulasan Kamu Sudah Tersimpan!
              </h4>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Terima kasih atas apresiasi dan penilaian untuk {productName}.
              </p>
            </div>
          </div>

          <div className="w-12 h-12 shrink-0 hidden sm:block">
            <img
              src="/brand/stiker/xyzi-stiker-senang.png"
              alt="XYZI Senang"
              className="w-full h-full object-contain drop-shadow"
            />
          </div>
        </div>

        {existingReview && (
          <div className="bg-white dark:bg-[#0b131a] p-4 rounded-2xl ink-border space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= (existingReview.rating || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
              <span className="text-xs font-black ml-1.5 text-carbon dark:text-white">
                {existingReview.rating} / 5 Bintang
              </span>
            </div>
            {existingReview.comment && (
              <p className="text-xs italic text-gray-700 dark:text-gray-300 font-medium">
                "{existingReview.comment}"
              </p>
            )}
            <p className="text-[10px] font-bold text-gray-500 uppercase">
              Oleh: {existingReview.customerName || "Kawan XYZ"}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`no-print max-w-full w-full bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4 text-left ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#ffd731] ink-border flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000000]">
            <MessageSquare className="w-4 h-4 text-black" />
          </div>
          <div>
            <h4 className="font-[var(--font-bricolage)] text-sm sm:text-base font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
              <span>Beri Penilaian & Ulasan</span>
              <Sparkles className="w-3.5 h-3.5 text-[#fb4903]" />
            </h4>
            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
              Bagaimana pengalamanmu berbelanja {productName}?
            </p>
          </div>
        </div>

        <div className="w-11 h-11 shrink-0 hidden sm:block">
          <img
            src="/brand/stiker/xyzi-stiker-senang.png"
            alt="XYZI Senang"
            className="w-full h-full object-contain drop-shadow"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div>
          <label className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1.5">
            Pilih Bintang Kepuasan:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#12121a] px-3 py-1.5 rounded-2xl ink-border">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 rounded hover:scale-125 transition-transform cursor-pointer"
                  title={`${star} Bintang`}
                  aria-label={`Beri ${star} Bintang`}
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
            </div>
            <span className="text-xs font-black text-carbon dark:text-white px-3 py-1.5 bg-[#ffd731]/30 dark:bg-[#ffd731]/20 rounded-xl ink-border">
              {rating === 5
                ? "⭐⭐⭐⭐⭐ Sangat Puas & Cepat"
                : rating === 4
                ? "⭐⭐⭐⭐ Puas"
                : rating === 3
                ? "⭐⭐⭐ Cukup"
                : rating === 2
                ? "⭐⭐ Kurang Puas"
                : "⭐ Kecewa"}
            </span>
          </div>
        </div>

        {/* Quick Review Tags */}
        <div>
          <label className="text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1.5">
            Pilihan Ulasan Cepat:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSelectQuickTag(tag)}
                className="px-2.5 py-1 text-[11px] font-bold rounded-xl ink-border bg-[#f8fafc] dark:bg-[#1e1e2c] text-carbon dark:text-gray-200 hover:bg-[#ffd731] hover:text-black dark:hover:bg-[#ffd731] dark:hover:text-black transition-colors cursor-pointer active:scale-95"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Input Name & Comment */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
              Nama / Inisial:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi S."
              maxLength={30}
              className="w-full px-3 py-2.5 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ffd731]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block mb-1">
              Komentar / Ulasan:
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis ulasan pengalaman belanjamu..."
              maxLength={200}
              className="w-full px-3 py-2.5 bg-[#f9fafb] dark:bg-[#12121a] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ffd731]"
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl ink-border border-red-300">
            ⚠ {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-[#ffd731] hover:bg-[#ffe366] text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl ink-border shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? "Mengirim Ulasan..." : "Kirim Ulasan & Penilaian"}</span>
        </button>
      </form>
    </div>
  );
}
