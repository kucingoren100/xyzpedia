import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Dashboard Admin | XYZPEDIA",
  description: "Panel Kontrol Manajemen Toko & Transaksi XYZPEDIA",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
