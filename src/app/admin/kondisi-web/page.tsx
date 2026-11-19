import AdminKondisiWebClient from "@/components/admin/AdminKondisiWebClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kondisi Web & Status Pemeliharaan — Admin XYZPEDIA",
  description: "Kelola status pemeliharaan (maintenance) web dan operasional sistem.",
};

export default function AdminKondisiWebPage() {
  return <AdminKondisiWebClient />;
}
