import { prisma } from "../src/lib/prisma";

async function main() {
  const apiKey = process.env.WAROENGKUY_API_KEY || "wrk_15f6505ecd7be057da1448373998d9fb39b7d24a";
  const url = "https://waroengkuy.com/api/reseller/v1/ppob/orders";

  const payload = {
    variant_id: 1220,
    target: "1022605844082",
    ref_id: "INV-XYZ-20261116-5571",
  };

  console.log("Sending order to Waroengkuy PPOB:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("Response status:", res.status);
  console.log("Response data:", JSON.stringify(data, null, 2));

  if (data.ok && data.order) {
    await prisma.order.update({
      where: { invoiceNumber: "INV-XYZ-20261116-5571" },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
        fulfilledAt: new Date(),
        notes: `Injeksi Sukses via Waroengkuy! Ref: ${data.order.ref}, SN: ${data.order.sn || "Pending SN"}, Status: ${data.order.status}`,
      },
    });
    console.log("✓ Database updated with supplier order reference!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
