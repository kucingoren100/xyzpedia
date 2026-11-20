import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import AdminKuponClient from "@/components/admin/AdminKuponClient";

export const metadata = {
  title: "Manajemen Kupon Promo | XYZPEDIA Admin",
};

export default async function AdminKuponPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminKuponClient session={session} />;
}
