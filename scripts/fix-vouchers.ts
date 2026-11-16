import { prisma } from "../src/lib/prisma";

async function fix() {
  console.log("=== MEMPERBAIKI KATEGORI VOUCHER DIGITAL & MENGHAPUS DUMMY ===");

  // 1. Hapus dummy steam-wallet
  const dummy = await prisma.product.findUnique({
    where: { slug: "steam-wallet" },
    include: { items: true, orders: true }
  });

  if (dummy) {
    if (dummy.orders.length > 0) {
      await prisma.order.deleteMany({ where: { productId: dummy.id } });
    }
    await prisma.productItem.deleteMany({ where: { productId: dummy.id } });
    await prisma.product.delete({ where: { id: dummy.id } });
    console.log("✓ Berhasil menghapus dummy product steam-wallet (bergambar PUBG).");
  }

  // 2. Pindahkan google-play ke voucher-digital
  await prisma.product.updateMany({
    where: { slug: "google-play" },
    data: {
      categorySlug: "voucher-digital",
      thumbnailUrl: "/images/voucher/google-play.webp",
      bannerUrl: "/images/voucher/google-play.webp",
      targetInputLabel: "Email Akun Google",
      targetInputPlaceholder: "Masukkan email penerima voucher",
      badgeText: "KODE RESMI",
      developer: "Google Play"
    }
  });
  console.log("✓ Google Play dipindahkan ke kategori Voucher Digital dengan logo resmi.");

  // 3. Pindahkan steam ke voucher-digital
  await prisma.product.updateMany({
    where: { slug: "steam" },
    data: {
      name: "Steam Wallet Code IDR",
      categorySlug: "voucher-digital",
      thumbnailUrl: "/images/voucher/steam.webp",
      bannerUrl: "/images/voucher/steam.webp",
      targetInputLabel: "Email Akun Steam / Pembeli",
      targetInputPlaceholder: "Masukkan email penerima kode Steam",
      badgeText: "KODE RESMI",
      developer: "Valve Corporation"
    }
  });
  console.log("✓ Steam dipindahkan ke kategori Voucher Digital dengan logo resmi.");

  // 4. Pindahkan vidio-voucher ke voucher-digital
  await prisma.product.updateMany({
    where: { slug: "vidio-voucher" },
    data: {
      categorySlug: "voucher-digital",
      thumbnailUrl: "/images/voucher/vidio.webp",
      bannerUrl: "/images/voucher/vidio.webp",
      targetInputLabel: "No. HP / Email Akun Vidio",
      targetInputPlaceholder: "Masukkan No HP / Email akun Vidio",
      badgeText: "KODE RESMI",
      developer: "Vidio"
    }
  });
  console.log("✓ Vidio Voucher dipindahkan ke kategori Voucher Digital dengan logo resmi.");
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
