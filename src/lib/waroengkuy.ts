export interface WaroengkuyPpobProduct {
  product: string;
  category: string;
  label: string;
  price: number;
  available?: boolean;
  variant_id?: string;
  id?: string;
  sku?: string;
  [key: string]: unknown;
}

export interface WaroengkuyProductGroup {
  name: string;
  slug: string;
  publisher: string;
  categorySlug: string;
  tagline: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl: string;
  requiresServer: boolean;
  targetInputLabel: string;
  targetInputPlaceholder: string;
  serverInputPlaceholder?: string;
  variants: {
    sku: string;
    name: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    isAvailable: boolean;
  }[];
}

const LOCAL_GAME_IMAGES: Record<string, string> = {
  "mobile-legends": "/images/games/mobile-legends.webp",
  "free-fire": "/images/games/free-fire.webp",
  "free-fire-membership": "/images/games/free-fire-membership.webp",
  "arena-of-valor": "/images/games/arena-of-valor.webp",
  "call-of-duty-mobile": "/images/games/call-of-duty-mobile.webp",
  "pubg-mobile": "/images/games/pubg-mobile.webp",
  "pubg-mobile-global": "/images/games/pubg-mobile-global.webp",
  "arena-breakout": "/images/games/arena-breakout.webp",
  "blood-strike": "/images/games/blood-strike.webp",
  "honor-of-kings": "/images/games/honor-of-kings.webp",
  "delta-force-mobile": "/images/games/delta-force-mobile.webp",
  "magic-chess-go-go": "/images/games/magic-chess-go-go.webp",
  "point-blank-zepetto": "/images/games/point-blank.webp",
  "point-blank": "/images/games/point-blank.webp",
};

export const LOCAL_PREMIUM_IMAGES: Record<string, string> = {
  "capcut-pro": "/images/premium/capcut-pro.webp",
  "capcut": "/images/premium/capcut-pro.webp",
  "netflix-premium": "/images/premium/netflix-premium.webp",
  "netflix": "/images/premium/netflix-premium.webp",
  "spotify-premium": "/images/premium/spotify-premium.webp",
  "spotify": "/images/premium/spotify-premium.webp",
  "youtube-premium": "/images/premium/youtube-premium.webp",
  "youtube": "/images/premium/youtube-premium.webp",
  "canva-pro": "/images/premium/canva-pro.webp",
  "canva": "/images/premium/canva-pro.webp",
  "chatgpt": "/images/premium/chatgpt.webp",
  "gemini": "/images/premium/gemini.webp",
  "google-gemini": "/images/premium/gemini.webp",
  "apple-music": "/images/premium/apple-music.webp",
  "hbo-max": "/images/premium/hbo-max.webp",
  "alight-motion": "/images/premium/alight-motion.webp",
  "meitu": "/images/premium/meitu.webp",
};

export const PREMIUM_PRODUCT_SLUGS: Record<
  string,
  {
    name: string;
    slug: string;
    developer: string;
    targetLabel: string;
    targetPlaceholder: string;
    instructions: string;
  }
> = {
  "capcut pro": {
    name: "CapCut Pro",
    slug: "capcut-pro",
    developer: "Bytedance",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789 atau email",
    instructions: "Detail akun CapCut Pro akan dikirimkan otomatis setelah pembayaran diverifikasi.",
  },
  "netflix premium": {
    name: "Netflix Premium UHD 4K",
    slug: "netflix-premium",
    developer: "Netflix, Inc.",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Detail akun Netflix Premium siap pakai dikirim otomatis via WhatsApp & Email.",
  },
  "spotify premium": {
    name: "Spotify Premium",
    slug: "spotify-premium",
    developer: "Spotify AB",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Spotify Premium siap pakai bergaransi resmi.",
  },
  "youtube": {
    name: "YouTube Premium",
    slug: "youtube-premium",
    developer: "Google LLC",
    targetLabel: "Email Akun Google",
    targetPlaceholder: "Contoh: emailmu@gmail.com",
    instructions: "Masukkan email Google Anda untuk menerima link invite YouTube Family.",
  },
  "canva": {
    name: "Canva Pro",
    slug: "canva-pro",
    developer: "Canva Pty Ltd",
    targetLabel: "Email Akun Canva",
    targetPlaceholder: "Contoh: emailcanva@gmail.com",
    instructions: "Masukkan email terdaftar di Canva untuk di-upgrade ke tim Canva Pro.",
  },
  "chatgpt": {
    name: "ChatGPT Plus",
    slug: "chatgpt",
    developer: "OpenAI",
    targetLabel: "Email Akun OpenAI",
    targetPlaceholder: "Contoh: emailmu@gmail.com",
    instructions: "Masukkan email akun OpenAI Anda untuk menerima aktivasi lisensi.",
  },
  "google gemini": {
    name: "Google Gemini Advanced",
    slug: "gemini",
    developer: "Google DeepMind",
    targetLabel: "Gmail Akun Google",
    targetPlaceholder: "Contoh: emailmu@gmail.com",
    instructions: "Aktivasi Google Gemini Advanced 1 Tahun bergaransi resmi.",
  },
  "apple music": {
    name: "Apple Music",
    slug: "apple-music",
    developer: "Apple Inc.",
    targetLabel: "Apple ID / Email",
    targetPlaceholder: "Contoh: appleid@icloud.com",
    instructions: "Masukkan Apple ID Anda untuk proses aktivasi langganan Apple Music.",
  },
  "hbo max": {
    name: "HBO Max",
    slug: "hbo-max",
    developer: "WarnerMedia",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Detail akun HBO Max akan dikirimkan otomatis setelah pembayaran selesai.",
  },
  "alight motion": {
    name: "Alight Motion Pro",
    slug: "alight-motion",
    developer: "Alight Creative",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Lisensi Alight Motion Pro 1 Tahun siap pakai tanpa watermark.",
  },
  "meitu": {
    name: "Meitu VIP",
    slug: "meitu",
    developer: "Meitu, Inc.",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Meitu VIP+ siap pakai untuk edit foto dan video AI.",
  },
  "zoom pro": {
    name: "Zoom Pro",
    slug: "zoom-pro",
    developer: "Zoom Video Communications",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Zoom Pro 100 Peserta bergaransi resmi.",
  },
  "wink": {
    name: "Wink VIP",
    slug: "wink",
    developer: "Meitu, Inc.",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Wink VIP+ kualitas video HD AI retouching.",
  },
  "scribd pro": {
    name: "Scribd Pro",
    slug: "scribd-pro",
    developer: "Scribd, Inc.",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akses jutaan ebook dan audiobook di Scribd.",
  },
  "leonardo ai": {
    name: "Leonardo AI",
    slug: "leonardo-ai",
    developer: "Leonardo Interactive",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Leonardo AI Ultimate dengan token credit generate gambar.",
  },
  "higgsfield plus": {
    name: "Higgsfield Plus",
    slug: "higgsfield-plus",
    developer: "Higgsfield AI",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Higgsfield AI video generator siap pakai.",
  },
  "remini web": {
    name: "Remini Web",
    slug: "remini-web",
    developer: "Bending Spoons",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Remini Web Pro AI photo enhancer.",
  },
  "runninghub": {
    name: "RunningHub",
    slug: "runninghub",
    developer: "RunningHub AI",
    targetLabel: "UID / Akun RunningHub",
    targetPlaceholder: "Contoh: UID akun",
    instructions: "Top up koin saldo RunningHub ComfyUI Cloud.",
  },
  "hma vpn": {
    name: "HMA VPN",
    slug: "hma-vpn",
    developer: "Privax",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun VPN premium HideMyAss aman & cepat.",
  },
  "surfshark vpn": {
    name: "Surfshark VPN",
    slug: "surfshark-vpn",
    developer: "Surfshark B.V.",
    targetLabel: "Nomor WhatsApp / Email",
    targetPlaceholder: "Contoh: 08123456789",
    instructions: "Akun Surfshark VPN premium tanpa batas perangkat.",
  },
};

export const PPOB_GAME_SLUGS: Record<
  string,
  {
    name: string;
    slug: string;
    publisher: string;
    requiresServer: boolean;
    targetLabel: string;
    serverPlaceholder?: string;
  }
> = {
  "mobile legends": {
    name: "Mobile Legends: Bang Bang",
    slug: "mobile-legends",
    publisher: "Moonton",
    requiresServer: true,
    targetLabel: "User ID",
    serverPlaceholder: "Zone ID (4-5 digit)",
  },
  "free fire": {
    name: "Free Fire",
    slug: "free-fire",
    publisher: "Garena",
    requiresServer: false,
    targetLabel: "Player ID",
  },
  "free fire membership": {
    name: "Free Fire Membership",
    slug: "free-fire-membership",
    publisher: "Garena",
    requiresServer: false,
    targetLabel: "Player ID Free Fire",
  },
  "arena of valor": {
    name: "Arena of Valor",
    slug: "arena-of-valor",
    publisher: "Garena",
    requiresServer: false,
    targetLabel: "OpenID / Akun AOV",
  },
  "call of duty mobile": {
    name: "Call of Duty: Mobile",
    slug: "call-of-duty-mobile",
    publisher: "Garena",
    requiresServer: false,
    targetLabel: "OpenID CODM",
  },
  "pubg mobile": {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    publisher: "Tencent / Level Infinite",
    requiresServer: false,
    targetLabel: "Player ID",
  },
  "pubg mobile global": {
    name: "PUBG Mobile Global",
    slug: "pubg-mobile-global",
    publisher: "Level Infinite",
    requiresServer: false,
    targetLabel: "Player ID",
  },
  "arena breakout": {
    name: "Arena Breakout",
    slug: "arena-breakout",
    publisher: "Level Infinite",
    requiresServer: false,
    targetLabel: "Player ID",
  },
  "blood strike": {
    name: "Blood Strike",
    slug: "blood-strike",
    publisher: "NetEase Games",
    requiresServer: false,
    targetLabel: "User ID",
  },
  "honor of kings": {
    name: "Honor of Kings",
    slug: "honor-of-kings",
    publisher: "Level Infinite",
    requiresServer: false,
    targetLabel: "Player ID",
  },
  "delta force mobile": {
    name: "Delta Force Mobile",
    slug: "delta-force-mobile",
    publisher: "TiMi Studio",
    requiresServer: false,
    targetLabel: "Player ID / UID",
  },
  "magic chess go go": {
    name: "Magic Chess: Go Go",
    slug: "magic-chess-go-go",
    publisher: "Moonton",
    requiresServer: true,
    targetLabel: "User ID",
    serverPlaceholder: "Zone ID (4-5 digit)",
  },
  "point blank zepetto": {
    name: "Point Blank Zepetto",
    slug: "point-blank",
    publisher: "Zepetto",
    requiresServer: false,
    targetLabel: "ID Akun Zepetto",
  },
  "point blank": {
    name: "Point Blank Zepetto",
    slug: "point-blank",
    publisher: "Zepetto",
    requiresServer: false,
    targetLabel: "ID Akun Zepetto",
  },
};

export class WaroengkuyClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = (
      process.env.WAROENGKUY_BASE_URL || "https://waroengkuy.com/api/reseller/v1"
    ).replace(/\/$/, "");
    this.apiKey = process.env.WAROENGKUY_API_KEY || "";
    this.timeout = Number(process.env.WAROENGKUY_TIMEOUT || 15) * 1000;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Fetch raw PPOB products from Waroengkuy
   */
  async fetchPpobProducts(): Promise<WaroengkuyPpobProduct[]> {
    if (!this.apiKey) {
      throw new Error("WAROENGKUY_API_KEY belum dikonfigurasi di environment.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/ppob/products`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: controller.signal,
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        throw new Error(
          `Waroengkuy PPOB request failed with status: ${response.status} ${response.statusText}`
        );
      }

      const body = await response.json();
      const items = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.items)
        ? body.items
        : [];

      return items;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch full catalog (including fallback /products)
   */
  async fetchCatalog(): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error("WAROENGKUY_API_KEY belum dikonfigurasi di environment.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: controller.signal,
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        throw new Error(
          `Waroengkuy Catalog request failed with status: ${response.status} ${response.statusText}`
        );
      }

      const body = await response.json();
      return Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.items)
        ? body.items
        : [];
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch and group Top Up Games from Waroengkuy
   */
  async fetchTopUpGameCatalog(): Promise<WaroengkuyProductGroup[]> {
    let ppobItems: WaroengkuyPpobProduct[] = [];
    try {
      ppobItems = await this.fetchPpobProducts();
    } catch (err) {
      console.warn("Waroengkuy PPOB endpoint failed, falling back to /products:", err);
    }

    const digitalItems = ppobItems.filter((it) => {
      const cat = String(it.category || "").toLowerCase();
      const prod = String(it.product || "").toLowerCase();
      return (
        cat === "digital" ||
        cat.includes("game") ||
        cat.includes("voucher") ||
        Object.keys(PPOB_GAME_SLUGS).some((k) => prod.includes(k))
      );
    });

    // Direct 1:1 price synchronization with Waroengkuy catalog
    const applyPricing = (baseCost: number) => {
      const finalPrice = Math.round(baseCost);
      const original = Math.round(finalPrice * 1.15);
      const discount = Math.max(0, Math.round(((original - finalPrice) / original) * 100));
      return { price: finalPrice, originalPrice: original, discountPercent: discount };
    };

    const grouped: Record<string, WaroengkuyProductGroup> = {};

    for (const it of digitalItems) {
      const rawProduct = String(it.product || "").trim();
      if (!rawProduct) continue;

      const normKey = rawProduct.toLowerCase();
      const matchedKey = Object.keys(PPOB_GAME_SLUGS).find(
        (k) => normKey === k || normKey.includes(k)
      );

      const meta = matchedKey
        ? PPOB_GAME_SLUGS[matchedKey]
        : {
            name: rawProduct,
            slug: rawProduct
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
            publisher: "Official Publisher",
            requiresServer: false,
            targetLabel: "Player ID / User ID",
            serverPlaceholder: undefined,
          };

      const slug = meta.slug;

      if (!grouped[slug]) {
        const image =
          LOCAL_GAME_IMAGES[slug] ||
          "/images/games/mobile-legends.webp";

        grouped[slug] = {
          name: meta.name,
          slug: slug,
          publisher: meta.publisher,
          categorySlug: "game-topup",
          tagline: `Top up ${meta.name} resmi instan proses hitungan detik`,
          description: `Layanan top up resmi ${meta.name} otomatis via server Waroengkuy dengan harga termurah dan proses instan.`,
          thumbnailUrl: image,
          bannerUrl: image,
          requiresServer: meta.requiresServer,
          targetInputLabel: meta.targetLabel,
          targetInputPlaceholder: `Contoh: 12345678`,
          serverInputPlaceholder: meta.serverPlaceholder,
          variants: [],
        };
      }

      const cost = Number(it.price) || 0;
      const pricing = applyPricing(cost);
      const sku =
        String(it.sku || it.variant_id || it.id || `WRK-${slug}-${grouped[slug].variants.length + 1}`);

      grouped[slug].variants.push({
        sku: sku,
        name: String(it.label || "Varian"),
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        discountPercent: pricing.discountPercent,
        isAvailable: it.available !== false,
      });
    }

    return Object.values(grouped);
  }

  /**
   * Fetch and group Premium Accounts / Digital Apps from Waroengkuy
   */
  async fetchPremiumAccountCatalog(): Promise<WaroengkuyProductGroup[]> {
    const rawItems = await this.fetchCatalog();
    const grouped: Record<string, WaroengkuyProductGroup> = {};

    for (const it of rawItems) {
      const rawProduct = String(it.product || it.name || "").trim();
      if (!rawProduct) continue;

      const normKey = rawProduct.toLowerCase();
      const matchedKey = Object.keys(PREMIUM_PRODUCT_SLUGS).find(
        (k) => normKey === k || normKey.includes(k)
      );

      const meta = matchedKey
        ? PREMIUM_PRODUCT_SLUGS[matchedKey]
        : {
            name: rawProduct,
            slug: rawProduct
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
            developer: "Official Provider",
            targetLabel: "Nomor WhatsApp / Email",
            targetPlaceholder: "Contoh: 08123456789 atau email",
            instructions: "Detail akun / langganan akan dikirimkan via WhatsApp dan Email.",
          };

      const slug = meta.slug;

      if (!grouped[slug]) {
        const image =
          LOCAL_PREMIUM_IMAGES[slug] ||
          it.image ||
          it.image_original ||
          "/images/premium/netflix-premium.webp";

        grouped[slug] = {
          name: meta.name,
          slug: slug,
          publisher: meta.developer,
          categorySlug: "akun-premium",
          tagline: `Langganan ${meta.name} resmi termurah bergaransi penuh`,
          description: String(
            it.description ||
              `Layanan akun & langganan premium resmi ${meta.name} via server Waroengkuy.`
          ),
          thumbnailUrl: image,
          bannerUrl: image,
          requiresServer: false,
          targetInputLabel: meta.targetLabel,
          targetInputPlaceholder: meta.targetPlaceholder,
          variants: [],
        };
      }

      const isManual = it.type === "manual";
      let isAvailable = false;
      if (isManual) {
        isAvailable = it.stock === null ? true : Number(it.stock) > 0;
      } else {
        isAvailable = Number(it.stock) > 0;
      }

      const cost = Number(it.price) || 0;
      const normalPrice =
        it.normal_price && Number(it.normal_price) > 0
          ? Number(it.normal_price)
          : Math.round(cost * 1.15);
      const discount =
        normalPrice > cost
          ? Math.round(((normalPrice - cost) / normalPrice) * 100)
          : 0;

      const sku = String(
        it.sku || it.variant_id || `WRK-PRM-${it.id || it.variant_id || grouped[slug].variants.length + 1}`
      );

      grouped[slug].variants.push({
        sku: sku,
        name: String(it.variant || it.name || it.label || "Paket"),
        price: cost,
        originalPrice: normalPrice,
        discountPercent: discount,
        isAvailable: isAvailable,
      });
    }

    return Object.values(grouped);
  }
}
