import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import AdminPenggunaClient from "@/components/admin/AdminPenggunaClient";

export const metadata = {
  title: "Manajemen Pengguna Admin | XYZPEDIA Admin",
};

export default async function AdminPenggunaPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminPenggunaClient session={session} />;
}
