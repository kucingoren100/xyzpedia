import { prisma } from "../src/lib/prisma";

async function check() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      categorySlug: true,
      thumbnailUrl: true,
      _count: { select: { items: true } }
    },
    orderBy: { categorySlug: "asc" }
  });
  console.log(`Total products: ${products.length}`);
  for (const p of products) {
    console.log(`[${p.categorySlug}] ${p.name} (${p.slug}) -> ${p.thumbnailUrl} (${p._count.items} items)`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
