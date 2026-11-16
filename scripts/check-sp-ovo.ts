import { prisma } from '../src/lib/prisma';

async function main() {
  const sp = await prisma.product.findUnique({
    where: { slug: 'saldo-shopeepay' },
    include: { items: true }
  });
  console.log('ShopeePay items:');
  const set = new Set(sp?.items.map(i => i.name));
  console.log(Array.from(set));

  const ovo = await prisma.product.findUnique({
    where: { slug: 'saldo-ovo' },
    include: { items: true }
  });
  console.log('\nOVO items:');
  const setOvo = new Set(ovo?.items.map(i => i.name));
  console.log(Array.from(setOvo));
}

main().finally(() => prisma.$disconnect());
