import { prisma } from "../src/lib/prisma";

async function main() {
  const order = await prisma.order.findUnique({
    where: { invoiceNumber: "INV-XYZ-20261116-7060" },
    include: { product: true, productItem: true },
  });
  console.log("Order:", {
    invoice: order?.invoiceNumber,
    product: order?.product.name,
    item: order?.productItem.name,
    sku: order?.productItem.sku,
    supplierPrice: order?.productItem.supplierPrice,
    targetUserId: order?.targetUserId,
    targetZoneId: order?.targetZoneId,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
