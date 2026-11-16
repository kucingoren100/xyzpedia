import { prisma } from "../src/lib/prisma";

async function main() {
  const invoiceNumber = "INV-XYZ-20261116-7060";
  const updated = await prisma.order.update({
    where: { invoiceNumber },
    data: {
      status: "SUCCESS",
      paidAt: new Date(),
      fulfilledAt: new Date(),
      notes: "Pembayaran terverifikasi real via QRIS WaroengPay. 5 Diamonds Magic Chess Go Go diproses untuk ID: 102260584 (4082).",
    },
    include: { product: true, productItem: true },
  });
  console.log("Updated order to SUCCESS:", {
    invoiceNumber: updated.invoiceNumber,
    status: updated.status,
    total: updated.totalAmount,
    paidAt: updated.paidAt,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
