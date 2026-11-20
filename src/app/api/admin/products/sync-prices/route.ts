import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { WaroengkuyClient } from "@/lib/waroengkuy";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  // Auth guard: only allow authenticated admins
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = new WaroengkuyClient();
    const [ppobRes, catalogRes] = await Promise.allSettled([
      client.fetchPpobProducts(),
      client.fetchCatalog(),
    ]);

    const ppobItems = ppobRes.status === "fulfilled" ? ppobRes.value : [];
    const catalogItems = catalogRes.status === "fulfilled" ? catalogRes.value : [];

    // Inspect database categories and counts using standard Prisma
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            items: true,
          },
        },
      },
    });

    const dbSummary = categories.map((c) => ({
      categorySlug: c.slug,
      categoryName: c.name,
      itemCount: c.products.reduce((acc, p) => acc + p.items.length, 0),
      productCount: c.products.length,
    }));

    // Find unsynced products
    const allProducts = categories.flatMap((c) => c.products);
    const unsyncedProducts = allProducts
      .map((p) => {
        const count = p.items.filter(
          (pi) => !pi.supplierPrice || pi.supplierPrice === 0 || pi.supplierPrice === Math.round(pi.price * 0.88)
        ).length;
        return {
          prodName: p.name,
          categorySlug: p.categorySlug,
          count,
        };
      })
      .filter((u) => u.count > 0);

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
  // Auth guard: only allow authenticated admins
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = req ? await req.json().catch(() => ({})) : {};
    const confirm = body?.confirm === true;
    const isDryRun = !confirm || body?.dryRun === true;
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

          const finalSku = item.sku ? item.sku : (matchedApiItem.variant_id || item.sku);
          const updateData: any = {
            supplierPrice: realSupplierPrice,
            stockStatus: matchedApiItem.available ? "AVAILABLE" : "OUT_OF_STOCK",
            sku: finalSku,
            price: item.price,
            originalPrice: item.originalPrice,
            discountPercent: item.discountPercent,
          };

          // Atur harga jual agar selalu menghasilkan margin profit sehat (proteksi margin minimum Rp 500 atau 5.5%)
          const minProfit = Math.max(500, Math.ceil(realSupplierPrice * 0.055));
          const minSafeSellPrice = Math.ceil((realSupplierPrice + minProfit) / 100) * 100;

          if (forceUpdateSellingPrice && item.price < minSafeSellPrice) {
            const newSellPrice = minSafeSellPrice;
            const newOriginalPrice = Math.round(newSellPrice * 1.15);
            const newDiscount = Math.max(0, Math.round(((newOriginalPrice - newSellPrice) / newOriginalPrice) * 100));

            updateData.price = newSellPrice;
            updateData.originalPrice = newOriginalPrice;
            updateData.discountPercent = newDiscount;
          }

          if (!isDryRun) {
            // Update product item cleanly with Prisma only when confirmed
            await prisma.productItem.update({
              where: { id: item.id },
              data: {
                supplierPrice: realSupplierPrice,
                stockStatus: updateData.stockStatus,
                price: updateData.price,
                originalPrice: updateData.originalPrice,
                discountPercent: updateData.discountPercent,
                sku: updateData.sku,
              },
            });

            // Synchronize Instan vs Manual label for Akun Premium based on supplier type
            if (cat === "akun-premium" && matchedApiItem.type) {
              const supplierLabel = matchedApiItem.type === "manual" ? "Manual" : "Instan";
              await prisma.product.update({
                where: { id: prod.id },
                data: {
                  developer: supplierLabel,
                },
              });
            }
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

    if (!isDryRun && totalUpdated > 0) {
      await logAuditEvent({
        actor: session.username,
        action: "sync_prices_confirmed",
        target: "catalog",
        summary: `Admin mensinkronkan harga modal & ketersediaan stok (${totalUpdated} item diperbarui)`,
      });
    }

    return NextResponse.json({
      success: true,
      dryRun: isDryRun,
      ppobItemsCount: ppobItems.length,
      catalogItemsCount: catalogItems.length,
      totalApiItems: unifiedApiItems.length,
      totalMatched,
      totalUpdated,
      categoryStats,
      sampleUpdates,
      message: isDryRun
        ? `Mode Pratinjau (Dry Run): Ditemukan ${totalUpdated} perubahan harga modal supplier. Kirimkan { confirm: true } untuk menerapkan.`
        : `Sinkronisasi harga berhasil! Sebanyak ${totalUpdated} harga modal supplier dan status stok telah diperbarui.`,
    });
  } catch (error: any) {
    console.error("Gagal sinkron harga supplier API:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
