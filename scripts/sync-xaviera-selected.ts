import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const XAVIERA_API_KEY = process.env.XAVIERA_API_KEY;
const XAVIERA_BASE_URL = process.env.XAVIERA_BASE_URL || "https://kiospremium.site/api/v1";

if (!XAVIERA_API_KEY) {
  console.error("ERROR: XAVIERA_API_KEY tidak ditemukan di environment variables (.env)!");
  console.error("Pastikan XAVIERA_API_KEY sudah diset di .env atau environment Vercel.");
  process.exit(1);
}

interface XavieraVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface XavieraProduct {
  id: string;
  name: string;
  category?: string;
  desc?: string;
  hasVariants?: boolean;
  price?: number | null;
  stock?: number | null;
  variants?: XavieraVariant[];
}

function calculateSellingPrice(supplierPrice: number): number {
  if (supplierPrice <= 500) {
    return 2500;
  }
  if (supplierPrice <= 1500) {
    return Math.round((supplierPrice + 2000) / 500) * 500;
  }
  if (supplierPrice <= 5000) {
    return Math.round((supplierPrice + 3500) / 500) * 500;
  }
  if (supplierPrice <= 15000) {
    return Math.round((supplierPrice * 1.35) / 500) * 500;
  }
  if (supplierPrice <= 50000) {
    return Math.round((supplierPrice * 1.25) / 500) * 500;
  }
  return Math.round((supplierPrice * 1.18) / 500) * 500;
}

async function fetchXavieraProducts(): Promise<XavieraProduct[]> {
  const res = await fetch(`${XAVIERA_BASE_URL}/products`, {
    headers: {
      Authorization: `Bearer ${XAVIERA_API_KEY}`,
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Xaviera products: ${res.statusText}`);
  }

  const json = await res.json();
  return json.products || json.data || json || [];
}

async function main() {
  console.log("=== SYNCHRONIZING SELECTED XAVIERA PREMIUM PRODUCTS ===");

  const category = await prisma.category.findUnique({
    where: { slug: "akun-premium" },
  });

  if (!category) {
    throw new Error("Category 'akun-premium' not found in database!");
  }

  console.log("Fetching live catalog from Xaviera Store API...");
  const xavieraProducts = await fetchXavieraProducts();
  console.log(`Fetched ${xavieraProducts.length} products from Xaviera.`);

  const targets = [
    {
      targetKey: "iqiyi",
      name: "iQiyi Premium",
      slug: "iqiyi",
      tagline: "Streaming drama Asia, anime & film box office tanpa jeda iklan",
      description: "Langganan iQiyi VIP resmi untuk menonton drama Korea, drama China, anime & film Asia kualitas full HD.",
      developer: "iQIYI International",
      thumbnailUrl: "/images/premium/iqiyi.svg",
      bannerUrl: "/images/premium/iqiyi.svg",
      badgeText: "POPULER",
      badgeColor: "mint-pop",
      targetInputLabel: "Email / No. HP Akun",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com / 08123456789",
      instructions: "Masukkan alamat email atau nomor HP aktif Anda untuk konfirmasi & aktivasi akun.",
      isPopular: true,
    },
    {
      targetKey: "loklok",
      name: "Loklok VIP",
      slug: "loklok",
      tagline: "Aplikasi streaming film blockbuster & series HD terlengkap",
      description: "Langganan Loklok VIP untuk menonton film bioskop terbaru, drama, dan anime bebas iklan.",
      developer: "Loklok Team",
      thumbnailUrl: "/images/premium/loklok.svg",
      bannerUrl: "/images/premium/loklok.svg",
      badgeText: "STREAMING",
      badgeColor: "electric-blue",
      targetInputLabel: "Email / No. WhatsApp Akun",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com / 08123456789",
      instructions: "Masukkan email atau nomor WhatsApp untuk pengiriman detail akun VIP.",
      isPopular: false,
    },
    {
      targetKey: "viu",
      name: "Viu Premium",
      slug: "viu",
      tagline: "Nonton drakor, anime & film Asia favorit tanpa jeda iklan",
      description: "Langganan Viu Premium resmi kualitas Full HD, download offline bebas sepuasnya.",
      developer: "PCCW Media",
      thumbnailUrl: "/images/premium/01_netflix_premium.webp", // Fallback, we will retain existing banner
      bannerUrl: null,
      badgeText: "TERLARIS",
      badgeColor: "sunflower",
      targetInputLabel: "Email / No. HP Akun Viu",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com / 08123456789",
      instructions: "Masukkan email atau nomor HP untuk pengiriman detail akun Viu Premium.",
      isPopular: true,
    },
    {
      targetKey: "youtube",
      name: "YouTube Premium",
      slug: "youtube-premium",
      tagline: "Nonton video & YouTube Music tanpa iklan, background play & download",
      description: "Upgrade akun YouTube ke Premium resmi untuk streaming video dan musik tanpa gangguan iklan.",
      developer: "Google LLC",
      thumbnailUrl: "/images/premium/youtube-premium.webp",
      bannerUrl: "/images/premium/youtube-premium.webp",
      badgeText: "NO ADS",
      badgeColor: "ember",
      targetInputLabel: "Email Akun Google / YouTube",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email Google/Gmail akun YouTube Anda. Detail akses dikirimkan ke email.",
      isPopular: true,
    },
    {
      targetKey: "crunchyroll",
      name: "Crunchyroll Premium",
      slug: "crunchyroll",
      tagline: "Streaming anime simulcast terlengkap subtitle Indonesia",
      description: "Langganan Crunchyroll Mega Fan resmi untuk menonton anime terbaru hanya 1 jam setelah tayang di Jepang.",
      developer: "Crunchyroll, LLC",
      thumbnailUrl: "/images/premium/crunchyroll.svg",
      bannerUrl: "/images/premium/crunchyroll.svg",
      badgeText: "ANIME",
      badgeColor: "ember",
      targetInputLabel: "Email Akun Crunchyroll",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email Anda untuk pengiriman akun Crunchyroll Premium.",
      isPopular: false,
    },
    {
      targetKey: "canva",
      name: "Canva Pro",
      slug: "canva-pro",
      tagline: "Akses jutaan template desain, AI magic tool & background remover",
      description: "Upgrade akun Canva ke Pro resmi untuk desain bebas tanpa batas watermarking dan akses 100M+ aset grafis.",
      developer: "Canva Pty Ltd",
      thumbnailUrl: "/images/premium/canva-pro.webp",
      bannerUrl: "/images/premium/canva-pro.webp",
      badgeText: "PRO DESAIN",
      badgeColor: "mint-pop",
      targetInputLabel: "Email Akun Canva",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email Canva Anda. Link invite / akses tim Pro langsung dikirimkan ke email.",
      isPopular: true,
    },
    {
      targetKey: "capcut",
      name: "CapCut Pro",
      slug: "capcut-pro",
      tagline: "Edit video tanpa watermark, akses fitur Pro & cloud storage",
      description: "Langganan CapCut Pro resmi untuk creator TikTok, Instagram Reels, dan YouTube Shorts.",
      developer: "Bytedance Pte. Ltd.",
      thumbnailUrl: "/images/premium/capcut-pro.webp",
      bannerUrl: null, // Keep existing banner if exists
      badgeText: "CREATOR",
      badgeColor: "ember",
      targetInputLabel: "Email Akun CapCut",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email CapCut Anda untuk pengiriman akses akun Pro.",
      isPopular: true,
    },
  ];

  for (const t of targets) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Processing Target: ${t.name} (slug: ${t.slug})`);

    // Cari produk di Xaviera
    const xavProd = xavieraProducts.find((p) => {
      const pName = (p.name || "").toLowerCase();
      if (t.targetKey === "canva") {
        return pName === "canva premium";
      }
      if (t.targetKey === "capcut") {
        return pName === "capcut";
      }
      if (t.targetKey === "youtube") {
        return pName === "youtube";
      }
      return pName.includes(t.targetKey);
    });

    if (!xavProd) {
      console.warn(`[WARNING] Product ${t.targetKey} not found in Xaviera!`);
      continue;
    }

    console.log(`Found in Xaviera: "${xavProd.name}" (ID: ${xavProd.id})`);

    // 1. Cek atau Buat/Update Product di DB
    let dbProd = await prisma.product.findUnique({
      where: { slug: t.slug },
      include: { items: true },
    });

    if (!dbProd) {
      console.log(`Creating new product ${t.name} in category akun-premium...`);
      dbProd = await prisma.product.create({
        data: {
          category: { connect: { id: category.id } },
          name: t.name,
          slug: t.slug,
          tagline: t.tagline,
          description: t.description,
          developer: t.developer,
          thumbnailUrl: t.thumbnailUrl,
          bannerUrl: t.bannerUrl || t.thumbnailUrl,
          badgeText: t.badgeText,
          badgeColor: t.badgeColor,
          requiresServer: false,
          targetInputLabel: t.targetInputLabel,
          targetInputPlaceholder: t.targetInputPlaceholder,
          instructions: t.instructions,
          isPopular: t.isPopular,
          isActive: true,
        },
        include: { items: true },
      });
      console.log(`Created product ID: ${dbProd.id}`);
    } else {
      console.log(`Product ${t.name} already exists (ID: ${dbProd.id}). Updating details...`);
      // Update data dasar jika perlu, tapi jangan timpa bannerUrl jika user sudah pernah upload custom
      await prisma.product.update({
        where: { id: dbProd.id },
        data: {
          name: t.name,
          tagline: t.tagline,
          description: t.description,
          developer: t.developer,
          thumbnailUrl: dbProd.thumbnailUrl || t.thumbnailUrl,
          badgeText: t.badgeText,
          badgeColor: t.badgeColor,
          targetInputLabel: t.targetInputLabel,
          targetInputPlaceholder: t.targetInputPlaceholder,
          instructions: t.instructions,
          isActive: true,
        },
      });
    }

    // 2. Bersihkan item manual lama jika ada instruksi ganti
    if (t.slug === "viu" || t.slug === "capcut-pro" || dbProd.items.some((i) => i.supplier === "MANUAL" || i.supplier === "WAROENGKUY")) {
      const deleted = await prisma.productItem.deleteMany({
        where: {
          productId: dbProd.id,
          orders: { none: {} }, // Hapus yang belum memiliki relasi order
        },
      });
      console.log(`Deleted ${deleted.count} old unlinked items for ${t.name}`);
    }

    // 3. Masukkan varian-varian dari Xaviera Store
    const variants = xavProd.variants && xavProd.variants.length > 0
      ? xavProd.variants
      : [
          {
            id: xavProd.id,
            name: xavProd.name,
            price: xavProd.price || 0,
            stock: xavProd.stock || 0,
          },
        ];

    let orderIndex = 1;
    for (const v of variants) {
      const supplierPrice = v.price || 0;
      const retailPrice = calculateSellingPrice(supplierPrice);
      const originalPrice = Math.round((retailPrice * 1.35) / 500) * 500;
      const stockStatus = (v.stock || 0) > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
      const sku = `XAV-${v.id}`;

      await prisma.productItem.upsert({
        where: { sku },
        update: {
          productId: dbProd.id,
          name: v.name,
          price: retailPrice,
          originalPrice,
          supplierPrice,
          stockStatus,
          supplier: "XAVIERA",
          bonusText: null, // Tanpa label merah
          order: orderIndex++,
        },
        create: {
          productId: dbProd.id,
          sku,
          name: v.name,
          price: retailPrice,
          originalPrice,
          supplierPrice,
          stockStatus,
          supplier: "XAVIERA",
          bonusText: null,
          order: orderIndex++,
        },
      });

      console.log(`  + Item [${sku}] ${v.name} | Modal: Rp ${supplierPrice.toLocaleString("id-ID")} -> Jual: Rp ${retailPrice.toLocaleString("id-ID")} | Stok: ${v.stock} (${stockStatus})`);
    }
  }

  console.log("\n=== ALL SELECTED XAVIERA PRODUCTS SYNCED SUCCESSFULLY! ===");
}

main()
  .catch((e) => {
    console.error("Sync error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
