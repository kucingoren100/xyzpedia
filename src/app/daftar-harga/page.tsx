import { prisma } from "@/lib/prisma";
import DaftarHargaClient from "@/components/DaftarHargaClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Harga Layanan Real-Time | XYZPEDIA",
  description:
    "Cek daftar harga lengkap dan status stok real-time top up game, akun premium, voucher digital, dan pulsa/e-wallet di XYZPEDIA.",
};

export default async function DaftarHargaPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        categorySlug: true,
        thumbnailUrl: true,
        items: {
          orderBy: { price: "asc" },
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            stockStatus: true,
          },
        },
      },
    }),
  ]);

  return <DaftarHargaClient categories={categories} products={products} />;
}
