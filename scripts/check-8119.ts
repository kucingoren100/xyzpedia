import { prisma } from "../src/lib/prisma";

async function check() {
  const res = await fetch("https://waroengkuy.com/api/reseller/v1/ppob/orders/8120", {
    headers: { Authorization: "Bearer wrk_15f6505ecd7be057da1448373998d9fb39b7d24a" },
  });
  const data = await res.json();
  console.log("Order 8120 status:", JSON.stringify(data, null, 2));

  if (data.ok && data.order) {
    await prisma.order.update({
      where: { invoiceNumber: "INV-XYZ-20261116-5571" },
      data: {
        status: data.order.status === "success" ? "SUCCESS" : data.order.status.toUpperCase(),
        notes: `Injeksi Sukses ke Moonton! Ref: ${data.order.ref} | SN: ${data.order.sn || "Processing"}`,
      },
    });
    console.log("Updated order notes in DB!");
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
