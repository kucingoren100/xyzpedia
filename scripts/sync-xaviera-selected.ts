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

/**
 * Otomatis mendeteksi tipe pengiriman konsisten: hanya "INSTAN" atau "MANUAL"
 */
function detectDeliveryType(xavProduct: { name?: string; desc?: string; variants?: { name?: string }[] }): "INSTAN" | "MANUAL" {
  const name = (xavProduct.name || "").toLowerCase();
  const desc = (xavProduct.desc || "").toLowerCase();
  const variantNames = (xavProduct.variants || []).map((v) => (v.name || "").toLowerCase()).join(" ");
  const allText = `${name} ${desc} ${variantNames}`;

  const isInvite = allText.includes("invite") || allText.includes("invit") || allText.includes("email buyer");
  const isPO = allText.includes(" po") || allText.includes("preorder") || allText.includes("pre-order");
  const isManual = allText.includes("manual") || allText.includes("jasa") || allText.includes("joki");

  if (isInvite || isPO || isManual) {
    return "MANUAL";
  }

  return "INSTAN";
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

interface TargetConfig {
  targetKey: string;
  xavieraId?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string | null;
  targetInputLabel: string;
  targetInputPlaceholder: string;
  instructions: string;
  isPopular?: boolean;
  forcedDeliveryType?: "INSTAN" | "MANUAL";
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

  const targets: TargetConfig[] = [
    // --- BATCH 1 ---
    {
      targetKey: "iqiyi",
      name: "iQiyi Premium",
      slug: "iqiyi",
      tagline: "Streaming drama Asia, anime & film box office tanpa jeda iklan",
      description: "Langganan iQiyi VIP resmi untuk menonton drama Korea, drama China, anime & film Asia kualitas full HD.",
      thumbnailUrl: "/images/premium/iqiyi.svg",
      bannerUrl: "/images/premium/iqiyi.svg",
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
      thumbnailUrl: "/images/premium/loklok.svg",
      bannerUrl: "/images/premium/loklok.svg",
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
      thumbnailUrl: "/images/premium/01_netflix_premium.webp",
      bannerUrl: null,
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
      thumbnailUrl: "/images/premium/youtube-premium.webp",
      bannerUrl: "/images/premium/youtube-premium.webp",
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
      thumbnailUrl: "/images/premium/crunchyroll.svg",
      bannerUrl: "/images/premium/crunchyroll.svg",
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
      thumbnailUrl: "/images/premium/canva-pro.webp",
      bannerUrl: "/images/premium/canva-pro.webp",
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
      thumbnailUrl: "/images/premium/capcut-pro.webp",
      bannerUrl: null,
      targetInputLabel: "Email Akun CapCut",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email CapCut Anda untuk pengiriman akses akun Pro.",
      isPopular: true,
    },

    // --- BATCH 2 ---
    {
      targetKey: "spotify",
      xavieraId: "p_b05ff4eb84a45786",
      name: "Spotify Premium",
      slug: "spotify",
      tagline: "Streaming musik, podcast & playlist favorit bebas iklan tanpa batas",
      description: "Langganan Spotify Premium resmi untuk mendengarkan lagu bebas iklan, download offline, dan unlimited skip.",
      thumbnailUrl: "/images/premium/spotify-premium.webp",
      bannerUrl: "/images/premium/spotify-premium.webp",
      targetInputLabel: "Email Akun Spotify",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email akun Spotify Anda. Kredensial / akses akun dikirimkan secara instan.",
      isPopular: true,
      forcedDeliveryType: "INSTAN",
    },
    {
      targetKey: "apple-music",
      xavieraId: "p_dd267622235306b9",
      name: "Apple Music",
      slug: "apple-music",
      tagline: "Streaming 100 juta lagu dengan Spatial Audio & Lossless Audio",
      description: "Langganan Apple Music resmi kualitas Dolby Atmos & Lossless Audio tanpa iklan.",
      thumbnailUrl: "/images/premium/apple-music.webp",
      bannerUrl: "/images/premium/apple-music.webp",
      targetInputLabel: "Apple ID / Email Akun Apple",
      targetInputPlaceholder: "Contoh: akunmu@icloud.com / akunmu@gmail.com",
      instructions: "Masukkan Apple ID atau email aktif Anda untuk aktivasi langganan Apple Music.",
      isPopular: false,
      forcedDeliveryType: "INSTAN",
    },
    {
      targetKey: "meitu",
      xavieraId: "p_e20162bbc8b0ca52",
      name: "Meitu VIP",
      slug: "meitu",
      tagline: "Aplikasi edit foto & video AI estetis no watermark kualitas HD",
      description: "Langganan Meitu VIP resmi untuk filter premium, AI retouch, dan fitur editing profesional tanpa watermark.",
      thumbnailUrl: "/images/premium/meitu.webp",
      bannerUrl: null,
      targetInputLabel: "Email / No. HP Akun Meitu",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com / 08123456789",
      instructions: "Masukkan email atau nomor HP untuk pengiriman detail akun Meitu VIP.",
      isPopular: false,
      forcedDeliveryType: "INSTAN",
    },
    {
      targetKey: "zoom-pro",
      xavieraId: "p_7b698b79e3ff3b3e",
      name: "Zoom Pro",
      slug: "zoom-pro",
      tagline: "Meeting online tanpa batas waktu 40 menit hingga 100 partisipan",
      description: "Upgrade akun Zoom ke lisensi Pro resmi untuk durasi meeting tak terbatas, cloud recording, dan fitur co-host.",
      thumbnailUrl: "/images/premium/zoom-pro.svg",
      bannerUrl: "/images/premium/zoom-pro.svg",
      targetInputLabel: "Email Akun Zoom",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email akun Zoom Anda untuk pengiriman lisensi/kredensial Zoom Pro.",
      isPopular: false,
      forcedDeliveryType: "INSTAN",
    },
    {
      targetKey: "alight-motion",
      xavieraId: "p_b50d50870cc4a64c",
      name: "Alight Motion Pro",
      slug: "alight-motion",
      tagline: "Aplikasi motion graphics, visual effects & video compositing profesional",
      description: "Langganan Alight Motion Pro resmi tanpa watermark, akses semua preset, efek premium & export XML.",
      thumbnailUrl: "/images/premium/alight-motion.webp",
      bannerUrl: "/images/premium/alight-motion.webp",
      targetInputLabel: "Email Akun Google / Alight Motion",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email akun Anda. Untuk varian Email Buyer, akun akan di-invite/diproses langsung ke email Anda.",
      isPopular: false,
      forcedDeliveryType: "MANUAL",
    },
    {
      targetKey: "bstation",
      xavieraId: "p_21e5b1a23b6f8fa5",
      name: "Bstation (Bilibili) VIP",
      slug: "bstation",
      tagline: "Platform anime nomor 1 di Asia Tenggara dengan subtitle resmi",
      description: "Langganan Bstation Premium / Bilibili VIP untuk menonton anime simulcast kualitas 4K & bebas iklan.",
      thumbnailUrl: "/images/premium/bstation.svg",
      bannerUrl: "/images/premium/bstation.svg",
      targetInputLabel: "Email / No. HP Akun Bstation",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com / 08123456789",
      instructions: "Masukkan email atau nomor HP untuk pengiriman detail akun Bstation VIP.",
      isPopular: false,
      forcedDeliveryType: "INSTAN",
    },
    {
      targetKey: "wink",
      xavieraId: "p_a893640a2707c2e8",
      name: "Wink Premium",
      slug: "wink-premium",
      tagline: "AI video enhancement, 4K restoration & portrait beauty tool",
      description: "Langganan Wink VIP resmi untuk perbaikan kualitas video hingga resolusi 4K dan fitur editing AI canggih.",
      thumbnailUrl: "/images/premium/meitu.webp", // Fallback, will keep DB banner
      bannerUrl: null,
      targetInputLabel: "Email / No. HP Akun Wink",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com / 08123456789",
      instructions: "Masukkan email atau nomor HP untuk pengiriman detail akun Wink Premium.",
      isPopular: false,
      forcedDeliveryType: "INSTAN",
    },
    {
      targetKey: "wetv",
      xavieraId: "p_79025547fd58dd84",
      name: "WeTV VIP",
      slug: "wetv",
      tagline: "Nonton drama Asia, anime & variety show terpopuler tanpa iklan",
      description: "Langganan WeTV VIP resmi untuk akses tayangan episode fast-track, kualitas Full HD/Blu-ray bebas iklan.",
      thumbnailUrl: "/images/premium/01_netflix_premium.webp", // Fallback, will keep DB banner
      bannerUrl: null,
      targetInputLabel: "Email / No. HP Akun WeTV",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com / 08123456789",
      instructions: "Masukkan email atau nomor HP untuk pengiriman detail akun WeTV VIP.",
      isPopular: false,
      forcedDeliveryType: "INSTAN",
    },
  ];

  for (const t of targets) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Processing Target: ${t.name} (slug: ${t.slug})`);

    // Cari produk di Xaviera berdasarkan xavieraId atau targetKey
    let xavProd: XavieraProduct | undefined;
    if (t.xavieraId) {
      xavProd = xavieraProducts.find((p) => p.id === t.xavieraId);
    }
    if (!xavProd) {
      xavProd = xavieraProducts.find((p) => {
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
    }

    if (!xavProd) {
      console.warn(`[WARNING] Product ${t.targetKey} not found in Xaviera!`);
      continue;
    }

    console.log(`Found in Xaviera: "${xavProd.name}" (ID: ${xavProd.id})`);

    // Deteksi otomatis label hanya: "INSTAN" atau "MANUAL" (atau gunakan override jika diset)
    const deliveryType = t.forcedDeliveryType || detectDeliveryType(xavProd);
    const badgeColor = deliveryType === "MANUAL" ? "slate" : "electric-blue";
    const developer = deliveryType === "MANUAL" ? "Manual" : "Instan";
    console.log(`Delivery Type: [${deliveryType}]`);

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
          developer,
          thumbnailUrl: t.thumbnailUrl,
          bannerUrl: t.bannerUrl || t.thumbnailUrl,
          badgeText: deliveryType,
          badgeColor,
          requiresServer: false,
          targetInputLabel: t.targetInputLabel,
          targetInputPlaceholder: t.targetInputPlaceholder,
          instructions: t.instructions,
          isPopular: t.isPopular || false,
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
          developer,
          thumbnailUrl: dbProd.thumbnailUrl || t.thumbnailUrl,
          badgeText: deliveryType,
          badgeColor,
          targetInputLabel: t.targetInputLabel,
          targetInputPlaceholder: t.targetInputPlaceholder,
          instructions: t.instructions,
          isActive: true,
        },
      });
    }

    // 2. Bersihkan item manual/lama jika ada (misal viu, capcut-pro, meitu, wink-premium, wetv)
    const hasOldItems =
      t.slug === "viu" ||
      t.slug === "capcut-pro" ||
      t.slug === "meitu" ||
      t.slug === "wink-premium" ||
      t.slug === "wetv" ||
      dbProd.items.some((i) => i.supplier === "MANUAL" || i.supplier === "WAROENGKUY");

    if (hasOldItems) {
      const deleted = await prisma.productItem.deleteMany({
        where: {
          productId: dbProd.id,
          orders: { none: {} }, // Hapus yang belum memiliki relasi order
          supplier: { not: "XAVIERA" },
        },
      });
      console.log(`Deleted ${deleted.count} old non-Xaviera items for ${t.name}`);
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
