import { prisma } from "./prisma";
import { getDigiflazzPriceList } from "./digiflazz";

/**
 * Brand to Product Slug mapping for Digiflazz items
 */
const BRAND_TO_PRODUCT_SLUG: Record<string, string> = {
  // Games
  "MOBILE LEGENDS": "mobile-legends",
  "FREE FIRE": "free-fire",
  "PUBG MOBILE": "pubg-mobile",
  "Magic Chess": "magic-chess-go-go",
  "MAGIC CHESS": "magic-chess-go-go",
  "HONOR OF KINGS": "honor-of-kings",
  "ARENA OF VALOR": "arena-of-valor",
  "CALL OF DUTY MOBILE": "call-of-duty-mobile",
  "POINT BLANK": "point-blank",
  "BLOOD STRIKE": "blood-strike",
  "DELTA FORCE": "delta-force-mobile",

  // Pulsa Operators
  "TELKOMSEL": "pulsa-telkomsel",
  "AXIS": "pulsa-axis",
  "INDOSAT": "pulsa-indosat",
  "XL": "pulsa-xl",
  "TRI": "pulsa-tri",
  "SMARTFREN": "pulsa-smartfren",
  "by.U": "pulsa-byu",
  "BY.U": "pulsa-byu",

  // E-Money / E-Wallet
  "DANA": "saldo-dana",
  "GO PAY": "saldo-gopay",
  "GOPAY": "saldo-gopay",
  "OVO": "saldo-ovo",
  "SHOPEEPAY": "saldo-shopeepay",
  "SHOPEE PAY": "saldo-shopeepay",
  "LINKAJA": "saldo-linkaja",
  "LINK AJA": "saldo-linkaja",
  "ASTRAPAY": "saldo-astrapay",
  "I.SAKU": "saldo-isaku",
  "GRABPAY": "saldo-grabpay",

  // PLN & Utilities
  "PLN": "pln-token",

  // Digital Vouchers
  "STEAM": "steam",
  "GOOGLE PLAY": "google-play",
  "VIDIO": "vidio-voucher",
};

/**
 * Calculate retail selling price from supplier price with margin and neat rounding
 */
export function calculateSellingPrice(supplierPrice: number, markupPercent = 8): number {
  if (!supplierPrice || supplierPrice <= 0) return 0;
  const rawPrice = supplierPrice * (1 + markupPercent / 100);
  // Round to nearest hundred upwards (e.g. 10847 -> 11800)
  return Math.ceil(rawPrice / 100) * 100;
}

export interface SyncOptions {
  markupPercent?: number;
  updateSellingPrice?: boolean;
}

export interface SyncResult {
  success: boolean;
  totalDigiflazzItems: number;
  syncedCount: number;
  skippedCount: number;
  updatedProducts: string[];
  message: string;
}

/**
 * Synchronize and map all Digiflazz prepaid products to database
 */
export async function syncDigiflazzToDatabase(options: SyncOptions = {}): Promise<SyncResult> {
  const markup = options.markupPercent ?? 8;
  const shouldUpdateSellingPrice = options.updateSellingPrice ?? true;

  const digiItems = await getDigiflazzPriceList("prepaid");
  if (!digiItems || !Array.isArray(digiItems) || digiItems.length === 0) {
    return {
      success: false,
      totalDigiflazzItems: 0,
      syncedCount: 0,
      skippedCount: 0,
      updatedProducts: [],
      message: "Tidak ada data produk yang diterima dari Digiflazz (kemungkinan limitasi RC 83).",
    };
  }

  // Pre-fetch all products
  const dbProducts = await prisma.product.findMany({
    select: { id: true, slug: true, name: true },
  });
  const productMapBySlug = new Map<string, { id: string; name: string }>();
  for (const p of dbProducts) {
    productMapBySlug.set(p.slug, { id: p.id, name: p.name });
  }

  let syncedCount = 0;
  let skippedCount = 0;
  const affectedProducts = new Set<string>();

  for (const item of digiItems) {
    const brand = (item.brand || "").trim();
    const productSlug = BRAND_TO_PRODUCT_SLUG[brand] || BRAND_TO_PRODUCT_SLUG[brand.toUpperCase()];

    if (!productSlug) {
      skippedCount++;
      continue;
    }

    const matchedProduct = productMapBySlug.get(productSlug);
    if (!matchedProduct) {
      skippedCount++;
      continue;
    }

    const sku = item.buyer_sku_code;
    if (!sku) {
      skippedCount++;
      continue;
    }

    const supplierPrice = Math.round(Number(item.price) || 0);
    const sellingPrice = calculateSellingPrice(supplierPrice, markup);
    const isAvailable = Boolean(item.buyer_product_status && item.seller_product_status);
    const stockStatus = isAvailable ? "AVAILABLE" : "OUT_OF_STOCK";

    // Clean up product name
    const cleanName = item.product_name || sku;

    try {
      await prisma.productItem.upsert({
        where: { sku },
        update: {
          supplierPrice,
          ...(shouldUpdateSellingPrice ? { price: sellingPrice } : {}),
          stockStatus,
          bonusText: item.desc ? String(item.desc).slice(0, 50) : null,
        },
        create: {
          productId: matchedProduct.id,
          sku,
          name: cleanName,
          price: sellingPrice,
          originalPrice: Math.round(sellingPrice * 1.15),
          supplierPrice,
          stockStatus,
          bonusText: item.desc ? String(item.desc).slice(0, 50) : null,
          order: 99,
        },
      });

      syncedCount++;
      affectedProducts.add(matchedProduct.name);
    } catch (upsertErr) {
      console.error(`[Digiflazz Sync] Failed upserting SKU ${sku}:`, upsertErr);
    }
  }

  return {
    success: true,
    totalDigiflazzItems: digiItems.length,
    syncedCount,
    skippedCount,
    updatedProducts: Array.from(affectedProducts),
    message: `Berhasil menyinkronkan ${syncedCount} item Digiflazz ke ${affectedProducts.size} produk katalog!`,
  };
}
