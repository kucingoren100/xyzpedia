import { POST } from "../src/app/api/admin/products/sync-prices/route";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== SINKRONISASI HARGA MODAL SUPPLIER DENGAN WAROENGKUY ===");
  const res = await POST();
  const data = await res.json();
  console.log("Hasil Sinkronisasi:", JSON.stringify(data, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
