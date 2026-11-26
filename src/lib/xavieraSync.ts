import { prisma } from "./prisma";
import { XavieraClient } from "./xaviera";

export interface SyncXavieraOptions {
  markupPercent?: number;
  updateSellingPrice?: boolean;
}

export interface SyncXavieraResult {
  success: boolean;
  totalXavieraProducts: number;
  syncedCount: number;
  updatedToOutOfStock: number;
  updatedToAvailable: number;
  skippedManualCount: number;
  updatedProducts: string[];
  message: string;
}

/**
 * Calculate retail selling price from supplier price with margin and neat rounding
 * Minimum Rp 500 profit margin
 */
function calculateXavieraSellingPrice(supplierPrice: number, markupPercent = 8, minMargin = 500): number {
  if (!supplierPrice || supplierPrice <= 0) return 0;
  const percentMargin = (supplierPrice * markupPercent) / 100;
  const safeMargin = Math.max(minMargin, percentMargin);
  const rawPrice = supplierPrice + safeMargin;
  // Round to nearest hundred upwards (e.g. 15450 -> 15500)
  return Math.ceil(rawPrice / 100) * 100;
}

/**
 * Synchronize live price and stock status from Xaviera Store API to database
 */
export async function syncXavieraToDatabase(
  options: SyncXavieraOptions = {}
): Promise<SyncXavieraResult> {
  const markup = options.markupPercent ?? 8;
  const shouldUpdateSellingPrice = options.updateSellingPrice ?? false;

  const client = new XavieraClient();
  const res = await client.getProducts();

  if (!res.success || !Array.isArray(res.products) || res.products.length === 0) {
    return {
      success: false,
      totalXavieraProducts: 0,
      syncedCount: 0,
      updatedToOutOfStock: 0,
      updatedToAvailable: 0,
      skippedManualCount: 0,
      updatedProducts: [],
      message: res.error || "Gagal mengambil data katalog dari Xaviera Store.",
    };
  }

  const xavProducts = res.products;

  // Build lookup map for both products (no-variants) and variants
  // Key: rawId without 'XAV-' prefix
  const xavItemMap = new Map<
    string,
    {
      id: string;
      name: string;
      price: number;
      stock: number;
      parentName?: string;
    }
  >();

  for (const prod of xavProducts) {
    // If product has no variants, the product itself is the item
    if (!prod.hasVariants || !prod.variants || prod.variants.length === 0) {
      if (typeof prod.price === "number") {
        xavItemMap.set(prod.id, {
          id: prod.id,
          name: prod.name,
          price: prod.price,
          stock: typeof prod.stock === "number" ? prod.stock : 0,
          parentName: prod.name,
        });
      }
    } else {
      // Product has variants
      for (const v of prod.variants) {
        xavItemMap.set(v.id, {
          id: v.id,
          name: v.name,
          price: typeof v.price === "number" ? v.price : 0,
          stock: typeof v.stock === "number" ? v.stock : 0,
          parentName: prod.name,
        });
      }
    }
  }

  // Fetch all premium account items from DB
  const dbItems = await prisma.productItem.findMany({
    where: {
      product: {
        categorySlug: "akun-premium",
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  let syncedCount = 0;
  let updatedToOutOfStock = 0;
  let updatedToAvailable = 0;
  let skippedManualCount = 0;
  const updatedProductsSet = new Set<string>();

  for (const it of dbItems) {
    // Skip purely manual items with vault / custom inventory
    const isExplicitManual =
      it.supplier === "MANUAL" ||
      it.sku?.startsWith("MANUAL-") ||
      it.sku?.startsWith("CUSTOM-");

    if (isExplicitManual) {
      skippedManualCount++;
      continue;
    }

    const rawSku = it.sku ? it.sku.replace(/^XAV-/, "").trim() : "";
    const xav = xavItemMap.get(rawSku) || xavItemMap.get(it.sku);

    if (xav) {
      const newSupplierPrice = xav.price;
      const isAvailable = xav.stock > 0;
      const newStockStatus = isAvailable ? "AVAILABLE" : "OUT_OF_STOCK";

      const updateData: any = {
        supplierPrice: newSupplierPrice,
        supplier: "XAVIERA",
        stockStatus: newStockStatus,
      };

      if (isAvailable && it.stockStatus !== "AVAILABLE") {
        updatedToAvailable++;
      } else if (!isAvailable && it.stockStatus === "AVAILABLE") {
        updatedToOutOfStock++;
      }

      if (shouldUpdateSellingPrice && newSupplierPrice > 0) {
        const calculatedPrice = calculateXavieraSellingPrice(newSupplierPrice, markup);
        // Only update selling price if higher than supplier price or currently 0
        if (calculatedPrice > newSupplierPrice) {
          updateData.price = calculatedPrice;
          if (it.originalPrice && it.originalPrice <= calculatedPrice) {
            updateData.originalPrice = Math.round(calculatedPrice * 1.15);
            updateData.discountPercent = 13;
          }
        }
      }

      await prisma.productItem.update({
        where: { id: it.id },
        data: updateData,
      });

      syncedCount++;
      updatedProductsSet.add(it.product.name);
    }
  }

  return {
    success: true,
    totalXavieraProducts: xavProducts.length,
    syncedCount,
    updatedToOutOfStock,
    updatedToAvailable,
    skippedManualCount,
    updatedProducts: Array.from(updatedProductsSet),
    message: `Berhasil menyinkronkan ${syncedCount} varian akun premium dari Xaviera Store (${updatedToAvailable} tersedia, ${updatedToOutOfStock} stok habis, ${skippedManualCount} manual dilewati).`,
  };
}
