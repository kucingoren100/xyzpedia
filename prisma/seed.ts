import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding legacy promotional coupons...");

  const coupons = [
    {
      code: "XYZPEDIA",
      type: "percent",
      value: 30,
      maxDiscount: 1500,
      minSpend: 0,
      active: true,
    },
    {
      code: "HEMAT5",
      type: "percent",
      value: 5,
      maxDiscount: 5000,
      minSpend: 0,
      active: true,
    },
    {
      code: "NEWUSER",
      type: "fixed",
      value: 2000,
      maxDiscount: 2000,
      minSpend: 10000,
      active: true,
    },
  ];

  for (const c of coupons) {
    try {
      await (prisma as any).coupon.upsert({
        where: { code: c.code },
        update: {},
        create: c,
      });
      console.log(`✓ Seeded coupon: ${c.code}`);
    } catch (e: any) {
      console.log(`ℹ Skipped coupon ${c.code} (table may not be migrated yet): ${e.message}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
