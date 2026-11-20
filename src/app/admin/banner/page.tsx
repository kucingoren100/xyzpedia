import { prisma } from "@/lib/prisma";
import AdminBannerClient from "@/components/admin/AdminBannerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Banner Promo | Admin XYZPEDIA",
};

export default async function AdminBannerPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return <AdminBannerClient initialBanners={banners} />;
}
