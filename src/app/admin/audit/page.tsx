import { getAdminSession } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import AdminAuditClient from "@/components/admin/AdminAuditClient";

export const metadata = {
  title: "Audit Log Aktivitas | XYZPEDIA Admin",
};

export default async function AdminAuditPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminAuditClient session={session} />;
}
