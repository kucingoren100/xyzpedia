import { prisma } from "../src/lib/prisma";

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { product: true, productItem: true },
  });
  console.log("Found orders count:", orders.length);
  for (const o of orders) {
    console.log({
      invoiceNumber: o.invoiceNumber,
      status: o.status,
      productName: o.product.name,
      variant: o.productItem.name,
      targetUserId: o.targetUserId,
      targetZoneId: o.targetZoneId,
      totalAmount: o.totalAmount,
      paymentRef: o.paymentRef,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      qrisString: o.qrisString ? o.qrisString.substring(0, 30) + "..." : null,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
      fulfilledAt: o.fulfilledAt,
      notes: o.notes,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
