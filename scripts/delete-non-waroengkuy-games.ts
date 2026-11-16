import { prisma } from "../src/lib/prisma";
import { WaroengkuyClient } from "../src/lib/waroengkuy";

async function main() {
  console.log("=== MENGHAPUS PRODUK TOP UP GAME YANG BUKAN DARI WAROENGKUY ===");

  const client = new WaroengkuyClient();
  const waroengkuyGroups = await client.fetchTopUpGameCatalog();
  const waroengkuySlugs = new Set(waroengkuyGroups.map((g) => g.slug));
  const waroengkuySkus = new Set(
    waroengkuyGroups.flatMap((g) => g.variants.map((v) => v.sku))
  );

  console.log(`Daftar slug valid dari Waroengkuy (${waroengkuySlugs.size}):`);
  console.log(Array.from(waroengkuySlugs).join(", "));

  // 1. Ambil semua produk dalam kategori game-topup
  const allGameProducts = await prisma.product.findMany({
    where: { categorySlug: "game-topup" },
    include: { items: true, orders: true },
  });

  const productsToDelete = allGameProducts.filter(
    (p) => !waroengkuySlugs.has(p.slug)
  );
  const productsToKeep = allGameProducts.filter((p) =>
    waroengkuySlugs.has(p.slug)
  );

  console.log(`\nMenemukan ${productsToDelete.length} produk game yang bukan dari Waroengkuy:`);
  for (const p of productsToDelete) {
    console.log(`- ${p.name} (${p.slug}) [${p.items.length} items, ${p.orders.length} orders]`);
  }

  // Hapus produk non-Waroengkuy
  for (const p of productsToDelete) {
    // Hapus order terkait jika ada
    if (p.orders.length > 0) {
      await prisma.order.deleteMany({
        where: { productId: p.id },
      });
      console.log(`  -> Menghapus ${p.orders.length} test order pada produk ${p.name}`);
    }
    // Hapus item terkait
    await prisma.productItem.deleteMany({
      where: { productId: p.id },
    });
    // Hapus produk
    await prisma.product.delete({
      where: { id: p.id },
    });
    console.log(`  ✓ Produk '${p.name}' (${p.slug}) berhasil dihapus.`);
  }

  // 2. Bersihkan juga dummy/mock items lama di dalam game Waroengkuy
  console.log("\nMemeriksa item dummy/mock non-Waroengkuy di dalam game yang dipertahankan...");
  let totalDeletedDummyItems = 0;

  for (const p of productsToKeep) {
    const dummyItems = p.items.filter((item) => !waroengkuySkus.has(item.sku));
    if (dummyItems.length > 0) {
      console.log(`\nGame '${p.name}' memiliki ${dummyItems.length} item non-Waroengkuy:`);
      for (const d of dummyItems) {
        console.log(`  - SKU: ${d.sku} | ${d.name}`);
        // Jika ada order yang menunjuk ke dummy item ini, hapus test order tersebut
        const relatedOrders = await prisma.order.findMany({
          where: { productItemId: d.id },
        });
        if (relatedOrders.length > 0) {
          await prisma.order.deleteMany({
            where: { productItemId: d.id },
          });
          console.log(`    (Dihapus ${relatedOrders.length} test order terkait)`);
        }
        await prisma.productItem.delete({
          where: { id: d.id },
        });
        totalDeletedDummyItems++;
      }
    }
  }

  console.log(`\n✓ Total ${totalDeletedDummyItems} item non-Waroengkuy berhasil dibersihkan dari game.`);

  // 3. Verifikasi kondisi akhir
  const remainingGames = await prisma.product.findMany({
    where: { categorySlug: "game-topup" },
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });

  console.log(`\n=== HASIL AKHIR KATALOG TOP UP GAME (${remainingGames.length} Game) ===`);
  let totalItems = 0;
  for (const g of remainingGames) {
    totalItems += g._count.items;
    console.log(`✓ ${g.name} (${g.slug}): ${g._count.items} item resmi Waroengkuy`);
  }
  console.log(`\nTOTAL PRODUK: ${remainingGames.length} Game`);
  console.log(`TOTAL DENOMINASI: ${totalItems} Item (Semua 100% dari API Waroengkuy)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
