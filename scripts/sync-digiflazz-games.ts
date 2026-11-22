import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const BRAND_TO_GAME_META: Record<
  string,
  {
    name: string;
    slug: string;
    developer: string;
    requiresServer: boolean;
    targetLabel: string;
    targetPlaceholder: string;
    serverPlaceholder?: string;
    thumbnailUrl: string;
    bannerUrl: string;
  }
> = {
  "MOBILE LEGENDS": {
    name: "Mobile Legends: Bang Bang",
    slug: "mobile-legends",
    developer: "Moonton",
    requiresServer: true,
    targetLabel: "User ID",
    targetPlaceholder: "Masukkan User ID",
    serverPlaceholder: "Zone ID (4-5 digit)",
    thumbnailUrl: "/images/games/mobile-legends.webp",
    bannerUrl: "/images/games/mobile-legends.webp",
  },
  "FREE FIRE": {
    name: "Free Fire",
    slug: "free-fire",
    developer: "Garena",
    requiresServer: false,
    targetLabel: "Player ID",
    targetPlaceholder: "Masukkan Player ID Free Fire",
    thumbnailUrl: "/images/games/free-fire.webp",
    bannerUrl: "/images/games/free-fire.webp",
  },
  "PUBG MOBILE": {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    developer: "Level Infinite",
    requiresServer: false,
    targetLabel: "Player ID",
    targetPlaceholder: "Masukkan Player ID PUBG",
    thumbnailUrl: "/images/games/pubg-mobile.webp",
    bannerUrl: "/images/games/pubg-mobile.webp",
  },
  "MAGIC CHESS": {
    name: "Magic Chess: Go Go",
    slug: "magic-chess-go-go",
    developer: "Moonton",
    requiresServer: true,
    targetLabel: "User ID",
    targetPlaceholder: "Masukkan User ID",
    serverPlaceholder: "Zone ID (4-5 digit)",
    thumbnailUrl: "/images/games/magic-chess-go-go.webp",
    bannerUrl: "/images/games/magic-chess-go-go.webp",
  },
  "HONOR OF KINGS": {
    name: "Honor of Kings",
    slug: "honor-of-kings",
    developer: "Level Infinite",
    requiresServer: false,
    targetLabel: "Player ID",
    targetPlaceholder: "Masukkan Player ID",
    thumbnailUrl: "/images/games/honor-of-kings.webp",
    bannerUrl: "/images/games/honor-of-kings.webp",
  },
  "ARENA OF VALOR": {
    name: "Arena of Valor",
    slug: "arena-of-valor",
    developer: "Garena",
    requiresServer: false,
    targetLabel: "OpenID AOV",
    targetPlaceholder: "Masukkan OpenID AOV",
    thumbnailUrl: "/images/games/arena-of-valor.webp",
    bannerUrl: "/images/games/arena-of-valor.webp",
  },
  "CALL OF DUTY MOBILE": {
    name: "Call of Duty: Mobile",
    slug: "call-of-duty-mobile",
    developer: "Garena",
    requiresServer: false,
    targetLabel: "OpenID CODM",
    targetPlaceholder: "Masukkan OpenID CODM",
    thumbnailUrl: "/images/games/call-of-duty-mobile.webp",
    bannerUrl: "/images/games/call-of-duty-mobile.webp",
  },
  "POINT BLANK": {
    name: "Point Blank Zepetto",
    slug: "point-blank",
    developer: "Zepetto",
    requiresServer: false,
    targetLabel: "Username Akun PB",
    targetPlaceholder: "Masukkan ID / Username akun PB",
    thumbnailUrl: "/images/games/point-blank.webp",
    bannerUrl: "/images/games/point-blank.webp",
  },
  "BLOOD STRIKE": {
    name: "Blood Strike",
    slug: "blood-strike",
    developer: "NetEase Games",
    requiresServer: false,
    targetLabel: "User ID Blood Strike",
    targetPlaceholder: "Masukkan User ID",
    thumbnailUrl: "/images/games/blood-strike.webp",
    bannerUrl: "/images/games/blood-strike.webp",
  },
  "DELTA FORCE": {
    name: "Delta Force Mobile",
    slug: "delta-force-mobile",
    developer: "TiMi Studio",
    requiresServer: false,
    targetLabel: "Player ID",
    targetPlaceholder: "Masukkan Player ID",
    thumbnailUrl: "/images/games/delta-force-mobile.webp",
    bannerUrl: "/images/games/delta-force-mobile.webp",
  },
  "ARENA BREAKOUT": {
    name: "Arena Breakout",
    slug: "arena-breakout",
    developer: "Level Infinite",
    requiresServer: false,
    targetLabel: "Role ID",
    targetPlaceholder: "Masukkan Role ID",
    thumbnailUrl: "/images/games/arena-breakout.webp",
    bannerUrl: "/images/games/arena-breakout.webp",
  },
  "GENSHIN IMPACT": {
    name: "Genshin Impact",
    slug: "genshin-impact",
    developer: "HoYoverse",
    requiresServer: true,
    targetLabel: "UID Genshin",
    targetPlaceholder: "Masukkan UID akun",
    serverPlaceholder: "Server (Asia/America/Europe/TW)",
    thumbnailUrl: "/images/games/genshin-impact.webp",
    bannerUrl: "/images/games/genshin-impact.webp",
  },
  "VALORANT": {
    name: "Valorant",
    slug: "valorant",
    developer: "Riot Games",
    requiresServer: false,
    targetLabel: "Riot ID",
    targetPlaceholder: "Username#TAG (misal: Player#1234)",
    thumbnailUrl: "/images/games/valorant.webp",
    bannerUrl: "/images/games/valorant.webp",
  },
};

async function fetchDigiflazzPricelist(): Promise<any[]> {
  const cachePath = path.join(process.cwd(), "digiflazz_cache.json");

  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_KEY;
  if (!username || !apiKey) {
    throw new Error("DIGIFLAZZ_USERNAME atau DIGIFLAZZ_KEY tidak disetel di .env!");
  }

  const sign = crypto.createHash("md5").update(username + apiKey + "pricelist").digest("hex");
  const bridgeUrl = process.env.DIGIFLAZZ_BRIDGE_URL || "http://217.216.146.24:30007";
  const bridgeSecret = process.env.DIGIFLAZZ_BRIDGE_SECRET;

  const url = `${bridgeUrl.replace(/\/$/, "")}/v1/price-list`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bridgeSecret) headers["X-Bridge-Secret"] = bridgeSecret;

  console.log(`Menghubungi Digiflazz endpoint via bridge (${url})...`);
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ cmd: "prepaid", username, sign }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  if (Array.isArray(json.data)) {
    fs.writeFileSync(cachePath, JSON.stringify(json.data, null, 2));
    console.log(`Berhasil mengambil ${json.data.length} item dari Digiflazz API!`);
    return json.data;
  }

  // Handle RC 83
  if (json?.data?.rc === "83" || json?.rc === "83") {
    console.warn("Notice: Limitasi RC 83 aktif di Digiflazz.");
    if (fs.existsSync(cachePath)) {
      console.log("Memuat data dari cache lokal disk...");
      const cached = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      return cached;
    }
    throw new Error(json?.data?.message || "Limitasi RC 83 aktif di Digiflazz. Harap tunggu beberapa saat.");
  }

  throw new Error("Respon tidak valid dari Digiflazz: " + JSON.stringify(json));
}

export async function main() {
  console.log("=== SINKRONISASI KATALOG TOP UP GAME DARI DIGIFLAZZ ===");

  // 1. Fetch pricelist
  const items = await fetchDigiflazzPricelist();

  // 2. Filter game items
  const gameItems = items.filter((it: any) => {
    const cat = (it.category || "").toLowerCase();
    const brand = (it.brand || "").toUpperCase();
    return (
      cat.includes("game") ||
      BRAND_TO_GAME_META[brand] !== undefined
    );
  });

  console.log(`Ditemukan ${gameItems.length} total item game di akun Digiflazz.`);

  // 3. Pastikan kategori game-topup ada
  const gameCategory = await prisma.category.upsert({
    where: { slug: "game-topup" },
    update: {},
    create: {
      name: "Top Up Game",
      slug: "game-topup",
      icon: "Gamepad2",
      badge: "Proses Kilat",
      order: 1,
    },
  });

  // 4. Hapus item-item lama dari Waroengkuy pada kategori game-topup
  // Item Waroengkuy memiliki SKU numerik atau supplier bukan DIGIFLAZZ
  console.log("\nMembersihkan SKU / varian lama dari Waroengkuy di kategori game-topup...");
  const oldWaroengkuyItems = await prisma.productItem.findMany({
    where: {
      product: { categorySlug: "game-topup" },
      OR: [
        { supplier: "WAROENGKUY" },
        { sku: { not: { startsWith: "CUSTOM-" } }, AND: [{ sku: { not: { startsWith: "SKU-" } } }] },
      ],
    },
    select: { id: true, sku: true, name: true, productId: true },
  });

  // Filter only items whose SKU is pure numeric (Waroengkuy item IDs like "1200", "1058")
  const numericWaroengkuyItems = oldWaroengkuyItems.filter((i) => /^\d+$/.test(i.sku));
  console.log(`Ditemukan ${numericWaroengkuyItems.length} item varian Waroengkuy numerik yang akan dihapus.`);

  for (const it of numericWaroengkuyItems) {
    await prisma.$transaction(async (tx) => {
      await tx.order.deleteMany({ where: { productItemId: it.id } });
      await tx.productItem.delete({ where: { id: it.id } });
    });
  }
  console.log("Item varian lama Waroengkuy berhasil dibersihkan!");

  // 5. Kelompokkan item Digiflazz berdasarkan Brand
  const groupedByBrand = new Map<string, any[]>();
  for (const it of gameItems) {
    const brand = (it.brand || "LAINNYA").trim().toUpperCase();
    if (!groupedByBrand.has(brand)) groupedByBrand.set(brand, []);
    groupedByBrand.get(brand)!.push(it);
  }

  let totalProductsSynced = 0;
  let totalItemsUpserted = 0;

  for (const [brand, brandItems] of groupedByBrand.entries()) {
    const meta = BRAND_TO_GAME_META[brand] || {
      name: brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase(),
      slug: brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      developer: "Official Publisher",
      requiresServer: false,
      targetLabel: "User ID",
      targetPlaceholder: `Masukkan ID akun ${brand}`,
      thumbnailUrl: "/images/games/mobile-legends.webp",
      bannerUrl: "/images/games/mobile-legends.webp",
    };

    console.log(`\n-> Memproses Game: ${meta.name} (${meta.slug}) [${brandItems.length} paket]...`);

    // Upsert Product
    const product = await prisma.product.upsert({
      where: { slug: meta.slug },
      update: {
        name: meta.name,
        categorySlug: gameCategory.slug,
        developer: meta.developer,
        requiresServer: meta.requiresServer,
        targetInputLabel: meta.targetLabel,
        targetInputPlaceholder: meta.targetPlaceholder,
        ...(meta.serverPlaceholder ? { serverInputPlaceholder: meta.serverPlaceholder } : {}),
      },
      create: {
        name: meta.name,
        slug: meta.slug,
        categorySlug: gameCategory.slug,
        developer: meta.developer,
        thumbnailUrl: meta.thumbnailUrl,
        bannerUrl: meta.bannerUrl,
        badgeText: "POPULER",
        badgeColor: "mint-pop",
        requiresServer: meta.requiresServer,
        targetInputLabel: meta.targetLabel,
        targetInputPlaceholder: meta.targetPlaceholder,
        serverInputPlaceholder: meta.serverPlaceholder || null,
        instructions: `Masukkan ${meta.targetLabel} Anda dengan benar. Pesanan diproses otomatis 24 jam nonstop via Digiflazz.`,
        importantNotice: "Pastikan ID dan server game sudah sesuai sebelum melanjutkan pembayaran.",
        warrantyTerms: "Garansi 100% item masuk atau uang kembali jika transaksi gagal.",
        isPopular: true,
        isActive: true,
      },
    });

    totalProductsSynced++;

    // Sort items by price ascending so 5 dm < 10 dm < 50 dm
    brandItems.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

    // Upsert ProductItems
    let orderIndex = 1;
    for (const it of brandItems) {
      const sku = it.buyer_sku_code;
      if (!sku) continue;

      const digiPrice = Math.round(Number(it.price) || 0);
      const isAvailable = Boolean(it.buyer_product_status && it.seller_product_status);
      const stockStatus = isAvailable ? "AVAILABLE" : "OUT_OF_STOCK";

      // Selling price is set directly to the price set in Digiflazz as requested
      const retailPrice = digiPrice;
      const originalPrice = Math.round(digiPrice * 1.12);

      await prisma.productItem.upsert({
        where: { sku },
        update: {
          productId: product.id,
          name: it.product_name || sku,
          price: retailPrice,
          originalPrice,
          supplierPrice: digiPrice,
          stockStatus,
          bonusText: it.desc ? String(it.desc).slice(0, 50) : null,
          supplier: "DIGIFLAZZ",
          order: orderIndex++,
        },
        create: {
          productId: product.id,
          sku,
          name: it.product_name || sku,
          price: retailPrice,
          originalPrice,
          supplierPrice: digiPrice,
          stockStatus,
          bonusText: it.desc ? String(it.desc).slice(0, 50) : null,
          supplier: "DIGIFLAZZ",
          order: orderIndex++,
        },
      });

      totalItemsUpserted++;
    }
  }

  // 6. Audit Log
  await prisma.auditLog.create({
    data: {
      actor: "system_admin",
      action: "SYNC_DIGIFLAZZ_GAMES",
      target: "game-topup",
      summary: `Berhasil membersihkan SKU Waroengkuy lama dan mensinkronkan ${totalItemsUpserted} item Digiflazz ke ${totalProductsSynced} produk game dengan harga langsung dari Digiflazz.`,
    },
  });

  console.log(`\n=== SUKSES! ===`);
  console.log(`Total Game: ${totalProductsSynced}`);
  console.log(`Total Item Digiflazz Masuk: ${totalItemsUpserted}`);
}

main()
  .catch((err) => {
    console.error("Error syncing Digiflazz games:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
