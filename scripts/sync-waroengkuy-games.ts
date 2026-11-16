import { prisma } from "../src/lib/prisma";
import { WaroengkuyClient, PPOB_GAME_SLUGS } from "../src/lib/waroengkuy";

async function main() {
  console.log("=== SINKRONISASI KATALOG TOP UP GAME DARI WAROENGKUY ===");
  console.log("Menghubungkan ke API Waroengkuy...");

  const client = new WaroengkuyClient();

  // Pastikan kategori game-topup ada
  const category = await prisma.category.upsert({
    where: { slug: "game-topup" },
    update: {},
    create: {
      name: "Top Up Game",
      slug: "game-topup",
      icon: "Gamepad2",
      badge: "Injeksi Instan",
      order: 1,
    },
  });

  console.log(`Kategori '${category.name}' siap.`);

  let groups = [];
  try {
    groups = await client.fetchTopUpGameCatalog();
  } catch (err: any) {
    console.error("Gagal menarik data dari Waroengkuy:", err?.message || err);
    process.exit(1);
  }

  console.log(`Ditemukan ${groups.length} game dari Waroengkuy.`);

  let totalProductsSynced = 0;
  let totalVariantsSynced = 0;

  for (const group of groups) {
    console.log(`\n-> Memproses ${group.name} (${group.slug}) [${group.variants.length} denominasi]...`);

    const isVoucher = group.slug === "google-play" || group.slug === "steam" || group.slug === "vidio-voucher";
    const prodCategorySlug = isVoucher ? "voucher-digital" : category.slug;
    const prodThumbnail = isVoucher
      ? `/images/voucher/${group.slug === "vidio-voucher" ? "vidio" : group.slug}.webp`
      : `/images/games/${group.slug}.webp`;

    // Upsert Product
    const product = await prisma.product.upsert({
      where: { slug: group.slug },
      update: {
        name: group.slug === "steam" ? "Steam Wallet Code IDR" : group.name,
        categorySlug: prodCategorySlug,
        thumbnailUrl: prodThumbnail,
        bannerUrl: prodThumbnail,
        developer: group.publisher,
        tagline: group.tagline,
        description: group.description,
        requiresServer: group.requiresServer,
        targetInputLabel: group.targetInputLabel,
        targetInputPlaceholder: group.targetInputPlaceholder,
        serverInputPlaceholder: group.serverInputPlaceholder,
      },
      create: {
        name: group.slug === "steam" ? "Steam Wallet Code IDR" : group.name,
        slug: group.slug,
        tagline: group.tagline,
        description: group.description,
        categorySlug: prodCategorySlug,
        developer: group.publisher,
        thumbnailUrl: prodThumbnail,
        bannerUrl: prodThumbnail,
        thumbnailUrl: group.thumbnailUrl,
        bannerUrl: group.bannerUrl,
        badgeText: "INSTAN",
        badgeColor: "mint-pop",
        requiresServer: group.requiresServer,
        targetInputLabel: group.targetInputLabel,
        targetInputPlaceholder: group.targetInputPlaceholder,
        serverInputPlaceholder: group.serverInputPlaceholder,
        instructions: `Masukkan ${group.targetInputLabel} akun Anda untuk memproses pesanan.`,
        isPopular: true,
      },
    });

    totalProductsSynced++;

    // Sinkronkan Varian / ProductItem
    let orderIndex = 1;
    for (const v of group.variants) {
      await prisma.productItem.upsert({
        where: { sku: v.sku },
        update: {
          name: v.name,
          price: v.price,
          originalPrice: v.originalPrice,
          discountPercent: v.discountPercent,
          stockStatus: v.isAvailable ? "AVAILABLE" : "OUT_OF_STOCK",
          order: orderIndex++,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          originalPrice: v.originalPrice,
          discountPercent: v.discountPercent,
          stockStatus: v.isAvailable ? "AVAILABLE" : "OUT_OF_STOCK",
          order: orderIndex++,
        },
      });
      totalVariantsSynced++;
    }
    console.log(`   ✓ Selesai sinkron ${group.variants.length} item untuk ${group.name}`);
  }

  console.log("\n========================================================");
  console.log(`🎉 Selesai! Berhasil mensinkronkan ${totalProductsSynced} Game dan ${totalVariantsSynced} Denominasi Top Up.`);
  console.log("========================================================");
}

main()
  .catch((e) => {
    console.error("Terjadi kesalahan saat sinkronisasi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
