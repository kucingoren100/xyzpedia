import { prisma } from '../src/lib/prisma';

async function main() {
  const prods = await prisma.product.findMany({
    where: { categorySlug: 'pulsa-ewallet' },
    include: { items: true }
  });

  for (const p of prods) {
    const names = p.items.map(i => i.name);
    console.log(`\n=== ${p.name} (${p.slug}) - ${p.items.length} items ===`);
    // Print unique prefixes or naming patterns
    console.log(names.slice(0, 15).join(' | '));
  }
}

main().finally(() => prisma.$disconnect());
