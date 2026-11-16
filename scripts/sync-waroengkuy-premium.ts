import { prisma } from "../src/lib/prisma";
import { WaroengkuyClient } from "../src/lib/waroengkuy";

async function main() {
  console.log("=== SINKRONISASI KATALOG AKUN PREMIUM DARI WAROENGKUY ===");
  console.log("Menghubungkan ke API Waroengkuy...");

  const client = new WaroengkuyClient();

  // Pastikan kategori akun-premium ada
  const category = await prisma.category.upsert({
    where: { slug: "akun-premium" },
    update: {},
    create: {
      name: "Akun & Langganan Premium",
      slug: "akun-premium",
      icon: "Tv",
      badge: "Garansi Full",
      order: 2,
    },
  });

  console.log(`Kategori '${category.name}' siap.`);

  let groups = [];
  try {
    groups = await client.fetchPremiumAccountCatalog();
  } catch (err: any) {
    console.error("Gagal menarik data dari Waroengkuy:", err?.message || err);
    process.exit(1);
  }

  console.log(`Ditemukan ${groups.length} produk akun premium dari Waroengkuy.`);

  const waroengkuySlugs = new Set(groups.map((g) => g.slug));
  const waroengkuySkus = new Set(
    groups.flatMap((g) => g.variants.map((v) => v.sku))
  );

  // 1. Bersihkan produk lama di kategori akun-premium yang BUKAN dari Waroengkuy
  const existingPremProducts = await prisma.product.findMany({
    where: { categorySlug: "akun-premium" },
    include: { items: true, orders: true },
  });

  for (const p of existingPremProducts) {
    if (!waroengkuySlugs.has(p.slug)) {
      console.log(`- Menghapus produk lama non-Waroengkuy: ${p.name} (${p.slug})...`);
      if (p.orders.length > 0) {
        await prisma.order.deleteMany({ where: { productId: p.id } });
      }
      await prisma.productItem.deleteMany({ where: { productId: p.id } });
      await prisma.product.delete({ where: { id: p.id } });
    }
  }

  // 2. Bersihkan varian dummy lama pada produk Waroengkuy yang tersisa
  for (const p of existingPremProducts) {
    if (waroengkuySlugs.has(p.slug)) {
      const dummyItems = p.items.filter((i) => !waroengkuySkus.has(i.sku));
      for (const d of dummyItems) {
        await prisma.order.deleteMany({ where: { productItemId: d.id } });
        await prisma.productItem.delete({ where: { id: d.id } });
      }
    }
  }

  // 3. Upsert Produk & Varian dari Waroengkuy
  let totalProductsSynced = 0;
  let totalVariantsSynced = 0;
  let totalAvailableVariants = 0;
  let totalOutOfStockVariants = 0;

  for (const group of groups) {
    console.log(
      `\n-> Memproses ${group.name} (${group.slug}) [${group.variants.length} paket]...`
    );

    const product = await prisma.product.upsert({
      where: { slug: group.slug },
      update: {
        name: group.name,
        developer: group.publisher,
        tagline: group.tagline,
        description: group.description,
        thumbnailUrl: group.thumbnailUrl,
        bannerUrl: group.bannerUrl,
        requiresServer: false,
        targetInputLabel: group.targetInputLabel,
        targetInputPlaceholder: group.targetInputPlaceholder,
      },
      create: {
        name: group.name,
        slug: group.slug,
        tagline: group.tagline,
        description: group.description,
        categorySlug: category.slug,
        developer: group.publisher,
        thumbnailUrl: group.thumbnailUrl,
        bannerUrl: group.bannerUrl,
        badgeText: "GARANSI",
        badgeColor: "voltage-violet",
        requiresServer: false,
        targetInputLabel: group.targetInputLabel,
        targetInputPlaceholder: group.targetInputPlaceholder,
        instructions: `Detail akun atau aktivasi ${group.name} akan dikirimkan otomatis setelah transaksi berhasil.`,
        isPopular: true,
      },
    });

    totalProductsSynced++;

    let orderIndex = 1;
    for (const v of group.variants) {
      const stockStatus = v.isAvailable ? "AVAILABLE" : "OUT_OF_STOCK";
      if (v.isAvailable) {
        totalAvailableVariants++;
      } else {
        totalOutOfStockVariants++;
      }

      await prisma.productItem.upsert({
        where: { sku: v.sku },
        update: {
          name: v.name,
          price: v.price,
          originalPrice: v.originalPrice,
          discountPercent: v.discountPercent,
          stockStatus: stockStatus,
          order: orderIndex++,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          originalPrice: v.originalPrice,
          discountPercent: v.discountPercent,
          stockStatus: stockStatus,
          order: orderIndex++,
        },
      });

      totalVariantsSynced++;
      console.log(
        `   • [${stockStatus === "AVAILABLE" ? "Tersedia" : "Stok habis"}] ${v.name} -> Rp ${v.price.toLocaleString("id-ID")}`
      );
    }
  }

  console.log("\n========================================================");
  console.log(`🎉 Sinkronisasi Akun Premium Selesai!`);
  console.log(`Total Produk: ${totalProductsSynced}`);
  console.log(`Total Paket/Varian: ${totalVariantsSynced}`);
  console.log(`- Varian Tersedia: ${totalAvailableVariants}`);
  console.log(`- Varian Stok Habis (Tetap Ditampilkan): ${totalOutOfStockVariants}`);
  console.log("========================================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
