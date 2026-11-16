import { prisma } from '../src/lib/prisma';
import { getProductSubCategories, getItemSubCategory } from '../src/lib/productSubCategories';

async function main() {
  const gopay = await prisma.product.findUnique({
    where: { slug: 'saldo-gopay' },
    include: { items: true }
  });

  if (!gopay) {
    console.log('gopay not found');
    return;
  }

  console.log('gopay product slug:', gopay.slug);
  const subs = getProductSubCategories(gopay.items, gopay.slug);
  console.log('subCategories for gopay:', subs);

  for (const item of gopay.items.slice(0, 15)) {
    console.log(`- "${item.name}" -> [${getItemSubCategory(item.name, gopay.slug)}]`);
  }
}

main().finally(() => prisma.$disconnect());
