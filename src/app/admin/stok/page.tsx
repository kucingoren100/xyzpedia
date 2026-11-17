import AdminStockClient from "@/components/admin/AdminStockClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cek Stok & Kesiapan Server Supplier | Admin XYZPEDIA",
  description: "Monitoring status ketersediaan produk dan varian ke server supplier secara real-time",
};

export default function AdminStockPage() {
  return <AdminStockClient />;
}
