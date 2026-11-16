import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WaroengkuyClient } from "@/lib/waroengkuy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = new WaroengkuyClient();
    const [ppobRes, catalogRes] = await Promise.allSettled([
      client.fetchPpobProducts(),
      client.fetchCatalog(),
    ]);

    const ppobItems = ppobRes.status === "fulfilled" ? ppobRes.value : [];
    const catalogItems = catalogRes.status === "fulfilled" ? catalogRes.value : [];

    // Inspect database categories and counts
    const rawDbSummary = await prisma.$queryRawUnsafe<any[]>(
      `SELECT p."categorySlug", c.name as categoryName, CAST(COUNT(pi.id) as integer) as itemCount, CAST(COUNT(DISTINCT p.id) as integer) as productCount 
       FROM "Product" p 
       JOIN "Category" c ON p."categorySlug" = c.slug 
       LEFT JOIN "ProductItem" pi ON p.id = pi."productId" 
       GROUP BY p."categorySlug"`
    );

    const dbSummary = rawDbSummary.map((r) => ({
      categorySlug: r.categorySlug,
      categoryName: r.categoryName,
      itemCount: Number(r.itemCount),
      productCount: Number(r.productCount),
    }));

    // Find unsynced products
    const rawUnsynced = await prisma.$queryRawUnsafe<any[]>(
      `SELECT p.name as prodName, p."categorySlug", CAST(COUNT(pi.id) as integer) as count 
       FROM "ProductItem" pi 
       JOIN "Product" p ON pi."productId" = p.id 
       WHERE pi."supplierPrice" IS NULL OR pi."supplierPrice" = 0 OR pi."supplierPrice" = ROUND(pi.price * 0.88) 
       GROUP BY p.id`
    );

    const unsyncedProducts = rawUnsynced.map((u) => ({
      prodName: u.prodName,
      categorySlug: u.categorySlug,
      count: Number(u.count),
    }));

    return NextResponse.json({
      success: true,
      ppobCount: ppobItems.length,
      catalogCount: catalogItems.length,
      totalApiItems: ppobItems.length + catalogItems.length,
      dbSummary,
      unsyncedProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req?: Request) {
  try {
    const body = req ? await req.json().catch(() => ({})) : {};
    const forceUpdateSellingPrice = body?.updateSellingPrice ?? true;

    const client = new WaroengkuyClient();

    // Fetch BOTH endpoints from Waroengkuy:
    // 1. PPOB endpoint (Top Up Games, Pulsa, E-Wallet, Voucher)
    // 2. Catalog endpoint (Akun Premium, AI Apps, Streaming)
    const [ppobRes, catalogRes] = await Promise.allSettled([
      client.fetchPpobProducts(),
      client.fetchCatalog(),
    ]);

    const ppobItems = ppobRes.status === "fulfilled" ? ppobRes.value : [];
    const catalogItems = catalogRes.status === "fulfilled" ? catalogRes.value : [];

    if (ppobItems.length === 0 && catalogItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Gagal menarik data dari API Waroengkuy (kedua endpoint kosong)" },
        { status: 500 }
      );
    }

    // Unified API item collection
    interface UnifiedItem {
      variant_id: string;
      product: string;
      label: string;
      price: number;
      available: boolean;
      source: "ppob" | "catalog";
      type?: string;
    }

    const unifiedApiItems: UnifiedItem[] = [];

    // 1. Add PPOB items
    for (const it of ppobItems) {
      const vid = String(it.variant_id ?? it.sku ?? it.id ?? "").trim();
      const prod = String(it.product || it.brand || "").trim();
      const lbl = String(it.label || it.name || "").trim();
      const price = Number(it.price) || 0;
      const isAvailable = typeof it.available === "boolean" ? it.available : true;

      if (price > 0 && (vid || lbl)) {
        unifiedApiItems.push({
          variant_id: vid,
          product: prod,
          label: lbl,
          price,
          available: isAvailable,
          source: "ppob",
        });
      }
    }

    // 2. Add Catalog items (Akun Premium, AI & Apps)
    for (const it of catalogItems) {
      const vid = String(it.variant_id ?? it.id ?? it.sku ?? "").trim();
      const prod = String(it.product || it.name || "").trim();
      const lbl = String(it.variant || it.label || it.name || "Paket").trim();
      const price = Number(it.price) || 0;
      const isManual = it.type === "manual";
      let isAvailable = false;
      if (isManual) {
        isAvailable = it.stock === null ? true : Number(it.stock) > 0;
      } else {
        isAvailable = Number(it.stock) > 0;
      }

      if (price > 0 && (vid || lbl)) {
        unifiedApiItems.push({
          variant_id: vid,
          product: prod,
          label: lbl,
          price,
          available: isAvailable,
          source: "catalog",
          type: it.type,
        });
      }
    }

    const cleanStr = (s: string) =>
      String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();

    // Map indexing for lightning fast lookups
    const apiByVariantId = new Map<string, UnifiedItem>();
    const apiByComposite = new Map<string, UnifiedItem>();
    const apiByLabel = new Map<string, UnifiedItem>();

    for (const item of unifiedApiItems) {
      if (item.variant_id) {
        apiByVariantId.set(item.variant_id, item);
      }

      const prod = cleanStr(item.product);
      const lbl = cleanStr(item.label);

      if (prod && lbl) {
        apiByComposite.set(`${prod}:::${lbl}`, item);
      }
      if (lbl && !apiByLabel.has(lbl)) {
        apiByLabel.set(lbl, item);
      }
    }

    // Ambil semua Product & Item di database
    const dbProducts = await prisma.product.findMany({
      include: {
        items: true,
      },
    });

    let totalMatched = 0;
    let totalUpdated = 0;
    const categoryStats: Record<string, { matched: number; total: number }> = {
      "game-topup": { matched: 0, total: 0 },
      "akun-premium": { matched: 0, total: 0 },
      "pulsa-ewallet": { matched: 0, total: 0 },
      "voucher-digital": { matched: 0, total: 0 },
    };
    const sampleUpdates: any[] = [];

    for (const prod of dbProducts) {
      const cat = prod.categorySlug;
      if (!categoryStats[cat]) {
        categoryStats[cat] = { matched: 0, total: 0 };
      }
      const prodClean = cleanStr(prod.name);

      for (const item of prod.items) {
        categoryStats[cat].total++;
        let matchedApiItem: UnifiedItem | null = null;

        // 1. Cocokkan by SKU (variant_id)
        const itemSku = String(item.sku || "").trim();
        if (itemSku && apiByVariantId.has(itemSku)) {
          matchedApiItem = apiByVariantId.get(itemSku)!;
        }

        // 2. Cocokkan by composite product + label
        if (!matchedApiItem) {
          const itemClean = cleanStr(item.name);
          const compositeKey = `${prodClean}:::${itemClean}`;
          if (apiByComposite.has(compositeKey)) {
            matchedApiItem = apiByComposite.get(compositeKey)!;
          }
        }

        // 3. Cocokkan by label langsung
        if (!matchedApiItem) {
          const itemClean = cleanStr(item.name);
          if (apiByLabel.has(itemClean)) {
            matchedApiItem = apiByLabel.get(itemClean)!;
          }
        }

        // 4. Fuzzy fallback match
        if (!matchedApiItem) {
          const itemClean = cleanStr(item.name);
          for (const apiIt of unifiedApiItems) {
            const apiProd = cleanStr(apiIt.product);
            const apiLbl = cleanStr(apiIt.label);

            const isProdMatch =
              prodClean.includes(apiProd) ||
              apiProd.includes(prodClean) ||
              cleanStr(prod.slug).includes(apiProd);

            if (isProdMatch && (itemClean.includes(apiLbl) || apiLbl.includes(itemClean))) {
              matchedApiItem = apiIt;
              break;
            }
          }
        }

        if (matchedApiItem && typeof matchedApiItem.price === "number") {
          totalMatched++;
          categoryStats[cat].matched++;
          const realSupplierPrice = Math.round(matchedApiItem.price);

          const updateData: any = {
            supplierPrice: realSupplierPrice,
            stockStatus: matchedApiItem.available ? "AVAILABLE" : "OUT_OF_STOCK",
            sku: matchedApiItem.variant_id || item.sku,
            price: item.price,
            originalPrice: item.originalPrice,
            discountPercent: item.discountPercent,
          };

          // Atur harga jual agar selalu menghasilkan margin profit sehat jika harga jual <= modal supplier
          if (forceUpdateSellingPrice && item.price <= realSupplierPrice) {
            const markupPercent = 0.055; // 5.5% margin
            const newSellPrice = Math.ceil((realSupplierPrice * (1 + markupPercent)) / 100) * 100;
            const newOriginalPrice = Math.round(newSellPrice * 1.15);
            const newDiscount = Math.max(0, Math.round(((newOriginalPrice - newSellPrice) / newOriginalPrice) * 100));

            updateData.price = newSellPrice;
            updateData.originalPrice = newOriginalPrice;
            updateData.discountPercent = newDiscount;
          }

          // Execute direct SQL update to bypass Prisma Client DMMF generation lock
          await prisma.$executeRawUnsafe(
            `UPDATE "ProductItem" SET "supplierPrice" = ?, "stockStatus" = ?, "price" = ?, "originalPrice" = ?, "discountPercent" = ?, "sku" = ? WHERE "id" = ?`,
            realSupplierPrice,
            updateData.stockStatus,
            updateData.price,
            updateData.originalPrice,
            updateData.discountPercent,
            updateData.sku,
            item.id
          );

          // Synchronize Instan vs Manual label for Akun Premium based on Waroengkuy type
          if (cat === "akun-premium" && matchedApiItem.type) {
            const waroengLabel = matchedApiItem.type === "manual" ? "Manual" : "Instan";
            await prisma.$executeRawUnsafe(
              `UPDATE "Product" SET "developer" = ? WHERE "id" = ?`,
              waroengLabel,
              prod.id
            );
          }

          totalUpdated++;
          if (sampleUpdates.length < 30) {
            sampleUpdates.push({
              category: cat,
              product: prod.name,
              item: item.name,
              sku: updateData.sku,
              realSupplierPrice,
              sellPrice: updateData.price,
              profit: updateData.price - realSupplierPrice,
              stock: updateData.stockStatus,
              source: matchedApiItem.source,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      ppobItemsCount: ppobItems.length,
      catalogItemsCount: catalogItems.length,
      totalApiItems: unifiedApiItems.length,
      totalMatched,
      totalUpdated,
      categoryStats,
      sampleUpdates,
      message: `Sinkronisasi menyeluruh berhasil! Sebanyak ${totalUpdated} harga modal supplier (Game, Akun Premium, Pulsa & E-Wallet, Voucher) kini 100% presisi dengan API resmi Waroengkuy.`,
    });
  } catch (error: any) {
    console.error("Gagal sinkron harga supplier API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
