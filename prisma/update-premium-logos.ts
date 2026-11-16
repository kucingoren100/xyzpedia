import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating premium account logos and expanding premium catalog...");

  // Update existing products
  await prisma.product.updateMany({
    where: { slug: "spotify-premium" },
    data: {
      thumbnailUrl: "/images/premium/spotify-premium.webp",
      bannerUrl: "/images/premium/spotify-premium.webp",
    },
  });

  await prisma.product.updateMany({
    where: { slug: "netflix-premium" },
    data: {
      thumbnailUrl: "/images/premium/netflix-premium.webp",
      bannerUrl: "/images/premium/netflix-premium.webp",
    },
  });

  await prisma.product.updateMany({
    where: { slug: "youtube-premium" },
    data: {
      thumbnailUrl: "/images/premium/youtube-premium.webp",
      bannerUrl: "/images/premium/youtube-premium.webp",
    },
  });

  const premiumProducts = [
    {
      name: "CapCut Pro",
      slug: "capcut-pro",
      tagline: "Edit video tanpa watermark fitur Pro & filter lengkap",
      description: "Langganan CapCut Pro resmi untuk creator video TikTok, Reels, dan YouTube.",
      categorySlug: "akun-premium",
      developer: "Bytedance",
      thumbnailUrl: "/images/premium/capcut-pro.webp",
      bannerUrl: "/images/premium/capcut-pro.webp",
      badgeText: "CREATOR",
      badgeColor: "ember",
      requiresServer: false,
      targetInputLabel: "Email Akun CapCut",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email yang terdaftar di aplikasi CapCut.",
      isPopular: true,
      items: [
        { sku: "CC-1M", name: "1 Bulan Private Akun", price: 18000, originalPrice: 45000, discountPercent: 60, bonusText: "Best Seller", order: 1 },
        { sku: "CC-1Y", name: "1 Tahun Private Akun", price: 85000, originalPrice: 240000, discountPercent: 65, bonusText: "Paling Hemat", order: 2 },
      ],
    },
    {
      name: "Canva Pro",
      slug: "canva-pro",
      tagline: "Akses jutaan template, magic AI & remove background",
      description: "Upgrade akun Canva kamu ke Canva Pro Lifetime / Durasi Resmi via Tim Edukasi atau Personal.",
      categorySlug: "akun-premium",
      developer: "Canva Pty Ltd",
      thumbnailUrl: "/images/premium/canva-pro.webp",
      bannerUrl: "/images/premium/canva-pro.webp",
      badgeText: "TERLARIS",
      badgeColor: "mint-pop",
      requiresServer: false,
      targetInputLabel: "Email Akun Canva",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email Canva Anda, link undangan tim Canva Pro akan dikirimkan.",
      isPopular: true,
      items: [
        { sku: "CNV-1Y", name: "1 Tahun Desain Bebas (Garansi Penuh)", price: 20000, originalPrice: 95000, discountPercent: 78, bonusText: "Super Murah", order: 1 },
        { sku: "CNV-LT", name: "Lifetime Akses Tim Pro (Garansi 1 Thn)", price: 35000, originalPrice: 150000, discountPercent: 76, bonusText: "Favorit", order: 2 },
      ],
    },
    {
      name: "Disney+ Hotstar",
      slug: "disney-hotstar",
      tagline: "Nonton film Marvel, Pixar, Star Wars & serial lokal",
      description: "Langganan Disney+ Hotstar resmi kualitas 4K UHD dolby audio tanpa buffering.",
      categorySlug: "akun-premium",
      developer: "The Walt Disney Company",
      thumbnailUrl: "/images/premium/disney-hotstar.webp",
      bannerUrl: "/images/premium/disney-hotstar.webp",
      badgeText: "4K CINEMA",
      badgeColor: "electric-blue",
      requiresServer: false,
      targetInputLabel: "Nomor HP / Email Disney+",
      targetInputPlaceholder: "Contoh: 08123456789",
      instructions: "Masukkan nomor HP akun Disney+ Hotstar Anda untuk aktivasi paket.",
      isPopular: true,
      items: [
        { sku: "DSN-1M", name: "1 Bulan Sharing Profile", price: 25000, originalPrice: 65000, discountPercent: 61, order: 1 },
        { sku: "DSN-3M", name: "3 Bulan Premium Private", price: 85000, originalPrice: 180000, discountPercent: 52, bonusText: "Hemat", order: 2 },
      ],
    },
    {
      name: "Google One 2TB",
      slug: "google-one",
      tagline: "Kapasitas Drive, Photos & Gmail lega 2TB",
      description: "Tambahan penyimpanan cloud Google One 2TB via sistem Family Sharing resmi aman 100%.",
      categorySlug: "akun-premium",
      developer: "Google LLC",
      thumbnailUrl: "/images/premium/google-one.webp",
      bannerUrl: "/images/premium/google-one.webp",
      badgeText: "STORAGE",
      badgeColor: "sunburst",
      requiresServer: false,
      targetInputLabel: "Email Google / Gmail",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Pastikan akun Gmail belum bergabung dengan Google Family group lain.",
      isPopular: false,
      items: [
        { sku: "G1-1M", name: "1 Bulan Storage 2TB", price: 25000, originalPrice: 135000, discountPercent: 81, order: 1 },
        { sku: "G1-1Y", name: "1 Tahun Storage 2TB", price: 175000, originalPrice: 1350000, discountPercent: 87, bonusText: "Best Value", order: 2 },
      ],
    },
    {
      name: "Gemini Advanced",
      slug: "gemini",
      tagline: "Akses AI tercanggih Google Gemini 2.5 Flash & Pro",
      description: "Upgrade akun Google Anda untuk menikmati fitur Gemini Advanced dengan konteks 1M token.",
      categorySlug: "akun-premium",
      developer: "Google DeepMind",
      thumbnailUrl: "/images/premium/gemini.webp",
      bannerUrl: "/images/premium/gemini.webp",
      badgeText: "AI PRO",
      badgeColor: "voltage-violet",
      requiresServer: false,
      targetInputLabel: "Email Akun Google",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan alamat email Google untuk aktivasi akses Gemini Advanced.",
      isPopular: true,
      items: [
        { sku: "GEM-1M", name: "1 Bulan Gemini Advanced", price: 45000, originalPrice: 309000, discountPercent: 85, bonusText: "Paling Laris", order: 1 },
      ],
    },
    {
      name: "Adobe Creative Cloud",
      slug: "adobe-creative-cloud",
      tagline: "Photoshop, Premiere, Illustrator & 20+ apps resmi",
      description: "Langganan Adobe Creative Cloud All Apps resmi langsung di akun email Adobe pribadi Anda.",
      categorySlug: "akun-premium",
      developer: "Adobe Inc.",
      thumbnailUrl: "/images/premium/adobe-creative-cloud.webp",
      bannerUrl: "/images/premium/adobe-creative-cloud.webp",
      badgeText: "ALL APPS",
      badgeColor: "ember",
      requiresServer: false,
      targetInputLabel: "Email Akun Adobe",
      targetInputPlaceholder: "Contoh: emailadobe@gmail.com",
      instructions: "Masukkan email Adobe ID Anda. Lisensi enterprise/education akan di-invite langsung.",
      isPopular: true,
      items: [
        { sku: "ADB-1M", name: "1 Bulan All Apps + Cloud 100GB", price: 95000, originalPrice: 850000, discountPercent: 88, order: 1 },
        { sku: "ADB-1Y", name: "1 Tahun All Apps + Cloud 100GB", price: 750000, originalPrice: 9500000, discountPercent: 92, bonusText: "Sultan", order: 2 },
      ],
    },
    {
      name: "Microsoft 365",
      slug: "microsoft-365",
      tagline: "Word, Excel, PowerPoint & OneDrive 1TB resmi",
      description: "Lisensi Microsoft 365 Family resmi untuk 5 perangkat (PC/Mac/HP) plus OneDrive 1TB.",
      categorySlug: "akun-premium",
      developer: "Microsoft Corporation",
      thumbnailUrl: "/images/premium/microsoft-365.webp",
      bannerUrl: "/images/premium/microsoft-365.webp",
      badgeText: "RESMI",
      badgeColor: "electric-blue",
      requiresServer: false,
      targetInputLabel: "Email Akun Microsoft / Outlook",
      targetInputPlaceholder: "Contoh: akunmu@outlook.com",
      instructions: "Masukkan email Microsoft yang ingin menerima tautan undangan lisensi 365.",
      isPopular: true,
      items: [
        { sku: "M365-1Y", name: "1 Tahun Family Invite (OneDrive 1TB)", price: 125000, originalPrice: 450000, discountPercent: 72, bonusText: "Paling Laris", order: 1 },
      ],
    },
    {
      name: "Apple Music",
      slug: "apple-music",
      tagline: "Lossless Audio, Spatial Audio & jutaan lagu",
      description: "Upgrade Apple ID kamu ke Apple Music Lossless audio via Family Plan legal.",
      categorySlug: "akun-premium",
      developer: "Apple Inc.",
      thumbnailUrl: "/images/premium/apple-music.webp",
      bannerUrl: "/images/premium/apple-music.webp",
      badgeText: "LOSSLESS",
      badgeColor: "ember",
      requiresServer: false,
      targetInputLabel: "Apple ID (Email iCloud)",
      targetInputPlaceholder: "Contoh: user@icloud.com",
      instructions: "Pastikan Apple ID region Indonesia dan tidak terikat Family Sharing lain.",
      isPopular: false,
      items: [
        { sku: "APM-1M", name: "1 Bulan Family Invite", price: 15000, originalPrice: 35000, discountPercent: 57, order: 1 },
        { sku: "APM-3M", name: "3 Bulan Family Invite", price: 40000, originalPrice: 105000, discountPercent: 61, bonusText: "Hemat", order: 2 },
      ],
    },
    {
      name: "HBO Max",
      slug: "hbo-max",
      tagline: "House of the Dragon, The Last of Us & Warner Movies",
      description: "Streaming tayangan HBO Originals dan film bioskop Warner Bros kualitas 4K HDR.",
      categorySlug: "akun-premium",
      developer: "Warner Bros. Discovery",
      thumbnailUrl: "/images/premium/hbo-max.webp",
      bannerUrl: "/images/premium/hbo-max.webp",
      badgeText: "ORIGINALS",
      badgeColor: "voltage-violet",
      requiresServer: false,
      targetInputLabel: "Email Pengiriman Akun",
      targetInputPlaceholder: "Contoh: emailmu@gmail.com",
      instructions: "Kredensial login akun HBO Max akan dikirim langsung ke email dan detail transaksi.",
      isPopular: false,
      items: [
        { sku: "HBO-1M", name: "1 Bulan Sharing Profile", price: 28000, originalPrice: 69000, discountPercent: 59, order: 1 },
      ],
    },
    {
      name: "ChatGPT Plus",
      slug: "chatgpt",
      tagline: "Akses GPT-4o, DALL-E 3 & fitur Voice Mode",
      description: "Akun ChatGPT Plus resmi untuk produktivitas, coding, dan riset tanpa batasan gratis.",
      categorySlug: "akun-premium",
      developer: "OpenAI",
      thumbnailUrl: "/images/premium/chatgpt.webp",
      bannerUrl: "/images/premium/chatgpt.webp",
      badgeText: "GPT-4o",
      badgeColor: "mint-pop",
      requiresServer: false,
      targetInputLabel: "Email Pengiriman Kredensial",
      targetInputPlaceholder: "Contoh: emailmu@gmail.com",
      instructions: "Akun ChatGPT Plus akan langsung dikirimkan detail email & passwordnya.",
      isPopular: true,
      items: [
        { sku: "GPT-1M-SHR", name: "1 Bulan Sharing Account", price: 45000, originalPrice: 320000, discountPercent: 85, bonusText: "Best Seller", order: 1 },
        { sku: "GPT-1M-PVT", name: "1 Bulan Private Akun Full", price: 290000, originalPrice: 350000, discountPercent: 17, order: 2 },
      ],
    },
    {
      name: "Alight Motion Pro",
      slug: "alight-motion",
      tagline: "Animasi grafik, efek visual & motion editing",
      description: "Langganan Alight Motion Pro tanpa watermark dan buka semua preset efek XML.",
      categorySlug: "akun-premium",
      developer: "Alight Creative, Inc.",
      thumbnailUrl: "/images/premium/alight-motion.webp",
      bannerUrl: "/images/premium/alight-motion.webp",
      badgeText: "PRO MOTION",
      badgeColor: "electric-blue",
      requiresServer: false,
      targetInputLabel: "Email Akun Alight Motion",
      targetInputPlaceholder: "Contoh: akunmu@gmail.com",
      instructions: "Masukkan email Google akun Alight Motion Anda.",
      isPopular: false,
      items: [
        { sku: "AM-1Y", name: "1 Tahun Akses Penuh (Private)", price: 25000, originalPrice: 99000, discountPercent: 74, bonusText: "Hemat", order: 1 },
      ],
    },
    {
      name: "Meitu VIP",
      slug: "meitu",
      tagline: "AI Photo Retouch, Anime Filter & Beauty Pro",
      description: "Buka semua filter aesthetic AI dan fitur pengeditan wajah Meitu VIP tanpa batas.",
      categorySlug: "akun-premium",
      developer: "Meitu, Inc.",
      thumbnailUrl: "/images/premium/meitu.webp",
      bannerUrl: "/images/premium/meitu.webp",
      badgeText: "AI BEAUTY",
      badgeColor: "sunburst",
      requiresServer: false,
      targetInputLabel: "Email / Kredensial Pengiriman",
      targetInputPlaceholder: "Contoh: emailmu@gmail.com",
      instructions: "Kredensial akun Meitu VIP akan dikirimkan otomatis setelah transaksi sukses.",
      isPopular: false,
      items: [
        { sku: "MTU-1M", name: "1 Bulan VIP Akses", price: 19000, originalPrice: 49000, discountPercent: 61, order: 1 },
        { sku: "MTU-1Y", name: "1 Tahun VIP Akses Penuh", price: 65000, originalPrice: 199000, discountPercent: 67, bonusText: "Favorit", order: 2 },
      ],
    },
  ];

  for (const item of premiumProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      await prisma.product.update({
        where: { slug: item.slug },
        data: {
          name: item.name,
          thumbnailUrl: item.thumbnailUrl,
          bannerUrl: item.bannerUrl,
          tagline: item.tagline,
          developer: item.developer,
        },
      });
      console.log(`Updated ${item.name}`);
    } else {
      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          tagline: item.tagline,
          description: item.description,
          categorySlug: item.categorySlug,
          developer: item.developer,
          thumbnailUrl: item.thumbnailUrl,
          bannerUrl: item.bannerUrl,
          badgeText: item.badgeText,
          badgeColor: item.badgeColor,
          requiresServer: item.requiresServer,
          targetInputLabel: item.targetInputLabel,
          targetInputPlaceholder: item.targetInputPlaceholder,
          instructions: item.instructions,
          isPopular: item.isPopular,
          items: {
            create: item.items,
          },
        },
      });
      console.log(`Created ${item.name}`);
    }
  }

  console.log("All premium account assets and catalog updated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
