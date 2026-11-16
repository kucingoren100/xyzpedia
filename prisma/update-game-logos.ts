import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating game logos and adding game catalog items...");

  // Update existing Mobile Legends & Free Fire
  await prisma.product.updateMany({
    where: { slug: "mobile-legends" },
    data: {
      thumbnailUrl: "/images/games/mobile-legends.webp",
      bannerUrl: "/images/games/mobile-legends.webp",
    },
  });

  await prisma.product.updateMany({
    where: { slug: "free-fire" },
    data: {
      thumbnailUrl: "/images/games/free-fire.webp",
      bannerUrl: "/images/games/free-fire.webp",
    },
  });

  const games = [
    {
      name: "Arena of Valor",
      slug: "arena-of-valor",
      tagline: "Vouchers AOV instan resmi Garena",
      description: "Top up Vouchers Arena of Valor resmi Garena Indonesia termurah dan tercepat.",
      categorySlug: "game-topup",
      developer: "Garena",
      thumbnailUrl: "/images/games/arena-of-valor.webp",
      bannerUrl: "/images/games/arena-of-valor.webp",
      badgeText: "INSTAN",
      badgeColor: "ember",
      requiresServer: false,
      targetInputLabel: "OpenID / Akun AOV",
      targetInputPlaceholder: "Contoh: 1234567890123456",
      instructions: "Buka profil game AOV Anda, salin OpenID akun Anda.",
      isPopular: true,
      items: [
        { sku: "AOV-40", name: "40 Vouchers", price: 10000, originalPrice: 12000, discountPercent: 16, order: 1 },
        { sku: "AOV-90", name: "90 Vouchers", price: 20000, originalPrice: 24000, discountPercent: 16, order: 2 },
        { sku: "AOV-230", name: "230 Vouchers", price: 50000, originalPrice: 58000, discountPercent: 13, order: 3 },
        { sku: "AOV-470", name: "470 Vouchers", price: 100000, originalPrice: 115000, discountPercent: 13, order: 4 },
      ],
    },
    {
      name: "Call of Duty: Mobile",
      slug: "call-of-duty-mobile",
      tagline: "Top up CP CODM resmi Garena instan",
      description: "Beli CP Call of Duty Mobile resmi Garena aman langsung masuk via OpenID.",
      categorySlug: "game-topup",
      developer: "Garena",
      thumbnailUrl: "/images/games/call-of-duty-mobile.webp",
      bannerUrl: "/images/games/call-of-duty-mobile.webp",
      badgeText: "TERLARIS",
      badgeColor: "mint-pop",
      requiresServer: false,
      targetInputLabel: "OpenID CODM",
      targetInputPlaceholder: "Contoh: 9876543210123456",
      instructions: "Buka menu Setting > Other di CODM untuk melihat OpenID akun Anda.",
      isPopular: true,
      items: [
        { sku: "CODM-31", name: "31 + 1 CP", price: 5000, originalPrice: 6000, discountPercent: 16, order: 1 },
        { sku: "CODM-128", name: "128 + 10 CP", price: 20000, originalPrice: 24000, discountPercent: 16, order: 2 },
        { sku: "CODM-321", name: "321 + 32 CP", price: 50000, originalPrice: 58000, discountPercent: 13, order: 3 },
        { sku: "CODM-645", name: "645 + 80 CP", price: 100000, originalPrice: 115000, discountPercent: 13, order: 4 },
        { sku: "CODM-BP", name: "Battle Pass Premium", price: 45000, originalPrice: 55000, discountPercent: 18, bonusText: "Best", order: 5 },
      ],
    },
    {
      name: "PUBG Mobile",
      slug: "pubg-mobile",
      tagline: "Top up UC PUBG Mobile resmi Indonesia",
      description: "Beli UC PUBG Mobile termurah langsung via Player ID resmi Tencent / Level Infinite.",
      categorySlug: "game-topup",
      developer: "Level Infinite",
      thumbnailUrl: "/images/games/pubg-mobile.webp",
      bannerUrl: "/images/games/pubg-mobile.webp",
      badgeText: "POPULER",
      badgeColor: "sunburst",
      requiresServer: false,
      targetInputLabel: "Player ID",
      targetInputPlaceholder: "Contoh: 5123456789",
      instructions: "Buka profil PUBG Mobile Anda dan salin nomor Player ID.",
      isPopular: true,
      items: [
        { sku: "PUBG-60", name: "60 Unknown Cash (UC)", price: 14500, originalPrice: 17000, discountPercent: 14, order: 1 },
        { sku: "PUBG-300", name: "300 + 25 UC", price: 72000, originalPrice: 85000, discountPercent: 15, order: 2 },
        { sku: "PUBG-600", name: "600 + 60 UC (Royale Pass)", price: 143000, originalPrice: 165000, discountPercent: 13, bonusText: "Royale Pass", order: 3 },
        { sku: "PUBG-1500", name: "1500 + 300 UC", price: 355000, originalPrice: 410000, discountPercent: 13, order: 4 },
      ],
    },
    {
      name: "PUBG Mobile Global",
      slug: "pubg-mobile-global",
      tagline: "Top up UC Global Region All Server",
      description: "UC PUBG Mobile Global untuk semua region dan server internasional.",
      categorySlug: "game-topup",
      developer: "Level Infinite",
      thumbnailUrl: "/images/games/pubg-mobile-global.webp",
      bannerUrl: "/images/games/pubg-mobile-global.webp",
      badgeText: "GLOBAL",
      badgeColor: "electric-blue",
      requiresServer: false,
      targetInputLabel: "Player ID",
      targetInputPlaceholder: "Contoh: 5123456789",
      instructions: "Masukkan Player ID PUBG Mobile Anda.",
      isPopular: false,
      items: [
        { sku: "PUBG-GL-60", name: "60 UC Global", price: 15000, originalPrice: 18000, discountPercent: 16, order: 1 },
        { sku: "PUBG-GL-325", name: "300 + 25 UC Global", price: 74000, originalPrice: 88000, discountPercent: 15, order: 2 },
        { sku: "PUBG-GL-660", name: "600 + 60 UC Global", price: 147000, originalPrice: 170000, discountPercent: 13, order: 3 },
      ],
    },
    {
      name: "Arena Breakout",
      slug: "arena-breakout",
      tagline: "Bonds Arena Breakout instan",
      description: "Top up Bonds Arena Breakout resmi Level Infinite pengiriman instan.",
      categorySlug: "game-topup",
      developer: "Level Infinite",
      thumbnailUrl: "/images/games/arena-breakout.webp",
      bannerUrl: "/images/games/arena-breakout.webp",
      badgeText: "INSTAN",
      badgeColor: "ember",
      requiresServer: false,
      targetInputLabel: "Player ID",
      targetInputPlaceholder: "Contoh: 1002345678",
      instructions: "Salin Player ID dari menu profil utama Arena Breakout.",
      isPopular: false,
      items: [
        { sku: "AB-60", name: "60 Bonds", price: 14000, originalPrice: 16500, discountPercent: 15, order: 1 },
        { sku: "AB-310", name: "310 Bonds", price: 70000, originalPrice: 82000, discountPercent: 14, order: 2 },
        { sku: "AB-630", name: "630 Bonds", price: 140000, originalPrice: 160000, discountPercent: 12, order: 3 },
      ],
    },
    {
      name: "Blood Strike",
      slug: "blood-strike",
      tagline: "Gold Blood Strike resmi NetEase",
      description: "Isi ulang Gold Blood Strike instan dan legal langsung via User ID.",
      categorySlug: "game-topup",
      developer: "NetEase",
      thumbnailUrl: "/images/games/blood-strike.webp",
      bannerUrl: "/images/games/blood-strike.webp",
      badgeText: "HEMAT",
      badgeColor: "mint-pop",
      requiresServer: false,
      targetInputLabel: "User ID",
      targetInputPlaceholder: "Contoh: 123456789",
      instructions: "Buka avatar profil Blood Strike Anda untuk menemukan User ID.",
      isPopular: false,
      items: [
        { sku: "BS-100", name: "100 Gold", price: 14000, originalPrice: 16000, discountPercent: 12, order: 1 },
        { sku: "BS-500", name: "500 + 30 Gold", price: 70000, originalPrice: 80000, discountPercent: 12, order: 2 },
        { sku: "BS-STRIKEPASS", name: "Strike Pass Elite", price: 65000, originalPrice: 79000, discountPercent: 17, bonusText: "Pass", order: 3 },
      ],
    },
    {
      name: "Honor of Kings",
      slug: "honor-of-kings",
      tagline: "Tokens HOK resmi Level Infinite",
      description: "Top up Tokens Honor of Kings global server resmi dan murah.",
      categorySlug: "game-topup",
      developer: "Level Infinite",
      thumbnailUrl: "/images/games/honor-of-kings.webp",
      bannerUrl: "/images/games/honor-of-kings.webp",
      badgeText: "HOT",
      badgeColor: "sunburst",
      requiresServer: false,
      targetInputLabel: "Player ID",
      targetInputPlaceholder: "Contoh: 2012345678",
      instructions: "Salin Player ID dari profil akun Honor of Kings Anda.",
      isPopular: true,
      items: [
        { sku: "HOK-80", name: "80 + 8 Tokens", price: 14500, originalPrice: 17000, discountPercent: 14, order: 1 },
        { sku: "HOK-240", name: "240 + 24 Tokens", price: 43000, originalPrice: 50000, discountPercent: 14, order: 2 },
        { sku: "HOK-800", name: "800 + 95 Tokens", price: 142000, originalPrice: 165000, discountPercent: 13, bonusText: "Best", order: 3 },
      ],
    },
    {
      name: "Delta Force Mobile",
      slug: "delta-force-mobile",
      tagline: "Koin & Delta Points resmi TiMi",
      description: "Isi ulang saldo Delta Force Mobile instan tanpa antri.",
      categorySlug: "game-topup",
      developer: "TiMi Studio",
      thumbnailUrl: "/images/games/delta-force-mobile.webp",
      bannerUrl: "/images/games/delta-force-mobile.webp",
      badgeText: "BARU",
      badgeColor: "voltage-violet",
      requiresServer: false,
      targetInputLabel: "Player ID / UID",
      targetInputPlaceholder: "Contoh: 7012345678",
      instructions: "Masukkan Player ID akun Delta Force Anda.",
      isPopular: false,
      items: [
        { sku: "DFM-60", name: "60 Delta Points", price: 15000, originalPrice: 18000, discountPercent: 16, order: 1 },
        { sku: "DFM-300", name: "300 + 30 Delta Points", price: 74000, originalPrice: 88000, discountPercent: 15, order: 2 },
      ],
    },
    {
      name: "Magic Chess: Go Go",
      slug: "magic-chess-go-go",
      tagline: "Top up Diamond MCGG resmi Moonton",
      description: "Layanan top up resmi Magic Chess: Go Go pengiriman otomatis via User ID & Zone ID.",
      categorySlug: "game-topup",
      developer: "Moonton",
      thumbnailUrl: "/images/games/magic-chess-go-go.webp",
      bannerUrl: "/images/games/magic-chess-go-go.webp",
      badgeText: "BARU",
      badgeColor: "mint-pop",
      requiresServer: true,
      targetInputLabel: "User ID",
      targetInputPlaceholder: "Contoh: 12345678",
      serverInputPlaceholder: "Zone ID (4-5 digit)",
      instructions: "Masukkan User ID dan Zone ID akun MCGG Anda.",
      isPopular: false,
      items: [
        { sku: "MCGG-50", name: "50 Diamonds", price: 12500, originalPrice: 15000, discountPercent: 16, order: 1 },
        { sku: "MCGG-150", name: "150 Diamonds", price: 36000, originalPrice: 42000, discountPercent: 14, order: 2 },
        { sku: "MCGG-PASS", name: "Chess Pass Season", price: 75000, originalPrice: 90000, discountPercent: 16, bonusText: "Best", order: 3 },
      ],
    },
    {
      name: "Point Blank Zepetto",
      slug: "point-blank",
      tagline: "Voucher PB Cash Zepetto resmi",
      description: "Top up PB Cash resmi Zepetto Indonesia instan untuk beli senjata dan item favorit.",
      categorySlug: "game-topup",
      developer: "Zepetto",
      thumbnailUrl: "/images/games/point-blank.webp",
      bannerUrl: "/images/games/point-blank.webp",
      badgeText: "KLASIK",
      badgeColor: "ember",
      requiresServer: false,
      targetInputLabel: "ID Akun Zepetto (Login ID)",
      targetInputPlaceholder: "Contoh: troopers123",
      instructions: "Masukkan User ID / Login ID Zepetto Anda.",
      isPopular: true,
      items: [
        { sku: "PB-1200", name: "1.200 PB Cash", price: 11000, originalPrice: 13000, discountPercent: 15, order: 1 },
        { sku: "PB-2400", name: "2.400 PB Cash", price: 21500, originalPrice: 25000, discountPercent: 14, order: 2 },
        { sku: "PB-6000", name: "6.000 PB Cash", price: 53000, originalPrice: 60000, discountPercent: 11, order: 3 },
        { sku: "PB-12000", name: "12.000 PB Cash", price: 104000, originalPrice: 118000, discountPercent: 11, bonusText: "Best", order: 4 },
      ],
    },
    {
      name: "Free Fire Membership",
      slug: "free-fire-membership",
      tagline: "Membership Mingguan & Bulanan FF Termurah",
      description: "Langganan Membership Mingguan dan Bulanan Free Fire resmi Garena klaim diamond tiap hari.",
      categorySlug: "game-topup",
      developer: "Garena",
      thumbnailUrl: "/images/games/free-fire-membership.webp",
      bannerUrl: "/images/games/free-fire-membership.webp",
      badgeText: "HEMAT 70%",
      badgeColor: "sunburst",
      requiresServer: false,
      targetInputLabel: "Player ID Free Fire",
      targetInputPlaceholder: "Contoh: 87654321",
      instructions: "Masukkan Player ID Free Fire Anda.",
      isPopular: true,
      items: [
        { sku: "FFM-WEEKLY", name: "Membership Mingguan (Weekly)", price: 29000, originalPrice: 35000, discountPercent: 17, bonusText: "Hemat", order: 1 },
        { sku: "FFM-MONTHLY", name: "Membership Bulanan (Monthly)", price: 116000, originalPrice: 140000, discountPercent: 17, bonusText: "Best Value", order: 2 },
        { sku: "FFM-COMBO", name: "Super VIP Combo (Mingguan + Bulanan)", price: 144000, originalPrice: 175000, discountPercent: 17, bonusText: "Paling Laris", order: 3 },
      ],
    },
  ];

  for (const game of games) {
    const existing = await prisma.product.findUnique({
      where: { slug: game.slug },
    });

    if (existing) {
      await prisma.product.update({
        where: { slug: game.slug },
        data: {
          name: game.name,
          thumbnailUrl: game.thumbnailUrl,
          bannerUrl: game.bannerUrl,
          tagline: game.tagline,
          developer: game.developer,
        },
      });
      console.log(`Updated ${game.name}`);
    } else {
      await prisma.product.create({
        data: {
          name: game.name,
          slug: game.slug,
          tagline: game.tagline,
          description: game.description,
          categorySlug: game.categorySlug,
          developer: game.developer,
          thumbnailUrl: game.thumbnailUrl,
          bannerUrl: game.bannerUrl,
          badgeText: game.badgeText,
          badgeColor: game.badgeColor,
          requiresServer: game.requiresServer,
          targetInputLabel: game.targetInputLabel,
          targetInputPlaceholder: game.targetInputPlaceholder,
          serverInputPlaceholder: game.serverInputPlaceholder,
          instructions: game.instructions,
          isPopular: game.isPopular,
          items: {
            create: game.items,
          },
        },
      });
      console.log(`Created ${game.name}`);
    }
  }

  console.log("All game assets and catalog updated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
