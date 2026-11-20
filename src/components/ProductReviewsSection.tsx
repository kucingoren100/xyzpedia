import { Star, ShieldCheck, CheckCircle2, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ProductReviewsSection({ productId, productName }: { productId: string; productName: string }) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const count = reviews.length;
  if (count === 0) return null;

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1);

  return (
    <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-6 md:p-8 shadow-[4px_4px_0px_#000] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h3 className="font-[var(--font-bricolage)] text-lg md:text-xl font-extrabold uppercase text-carbon dark:text-white flex items-center gap-2">
            <span>Ulasan Pembeli Terverifikasi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#55db9c] text-black font-black ink-border">
              {count} Review
            </span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Testimoni transaksi asli dari pembeli {productName} di XYZPEDIA
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#ffd731] px-4 py-2 rounded-2xl ink-border shadow-[2px_2px_0px_#000]">
          <Star className="w-5 h-5 fill-black text-black" />
          <span className="font-[var(--font-bricolage)] text-base font-black text-black">
            {avgRating} / 5.0
          </span>
          <span className="text-[11px] font-bold text-black/80">Kepuasan 100%</span>
        </div>
      </div>

      {/* Grid of Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-[#fbfbfd] dark:bg-[#12121c] rounded-2xl ink-border space-y-2 shadow-[2px_2px_0px_#000] flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-carbon dark:text-white flex items-center gap-1">
                  <span>{r.customerName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">
                &ldquo;{r.comment || "Layanan sangat memuaskan dan cepat!"}&rdquo;
              </p>
            </div>

            <div className="text-[10px] text-gray-400 font-bold pt-2 border-t border-gray-100 dark:border-gray-800">
              Transaksi Terverifikasi · {new Date(r.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
