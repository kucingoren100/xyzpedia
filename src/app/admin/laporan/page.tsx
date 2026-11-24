import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { getAdminReport } from "@/app/actions/adminReport";
import AdminLaporanClient from "@/components/admin/AdminLaporanClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Penjualan & Laba Supplier | Admin XYZPEDIA",
  description: "Laporan performa penjualan, metrik omzet, konversi, dan laba bersih per supplier.",
};

export default async function AdminLaporanPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const initialReport = await getAdminReport("30d");

  return <AdminLaporanClient initialData={initialReport} />;
}
