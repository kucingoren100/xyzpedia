import { getOrdersByAccessToken } from "@/app/actions/order";
import CekTransaksiAksesClient from "@/components/CekTransaksiAksesClient";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Riwayat Akses Pesanan | XYZPEDIA",
  description: "Akses aman riwayat transaksi pesanan via magic link terverifikasi.",
};

export default async function CekTransaksiAksesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="min-h-screen bg-[#fafafc] dark:bg-[#12121c] py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-[#181824] ink-border rounded-3xl p-8 text-center shadow-[4px_4px_0px_#000000] space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
            Tautan Tidak Valid
          </h1>
          <p className="text-xs text-gray-500 font-bold leading-relaxed">
            Tautan akses pesanan ini tidak menyertakan token keamanan atau parameter telah diubah.
          </p>
          <Link
            href="/cek-transaksi"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffd731] text-black font-black text-xs rounded-xl ink-border shadow-[2px_2px_0px_#000000]"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Cek Pesanan
          </Link>
        </div>
      </main>
    );
  }

  const result = await getOrdersByAccessToken(token);

  return (
    <main className="min-h-screen bg-[#fafafc] dark:bg-[#12121c] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <CekTransaksiAksesClient result={result} token={token} />
      </div>
    </main>
  );
}
