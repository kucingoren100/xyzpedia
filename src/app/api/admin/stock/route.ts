import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.WAROENGKUY_API_KEY || "";
    const baseUrl = (
      process.env.WAROENGKUY_BASE_URL || "https://waroengkuy.com/api/reseller/v1"
    ).replace(/\/$/, "");

    // 1. Fetch balance & profile
    const balRes = await fetch(`${baseUrl}/balance`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
    });
    const balData = await balRes.json().catch(() => ({}));

    // 2. Fetch PPOB products from Waroengkuy
    const ppobRes = await fetch(`${baseUrl}/ppob/products`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
    });
    const ppobData = await ppobRes.json().catch(() => ({}));
    const ppobItems: any[] = ppobData.items || [];

    // Map Waroengkuy availability by variant_id
    const apiMap = new Map<number, any>();
    for (const it of ppobItems) {
      if (it.variant_id) {
        apiMap.set(Number(it.variant_id), it);
      }
    }

    // 3. Fetch products and items from database
    const dbProducts = await prisma.product.findMany({
      include: {
        items: {
          orderBy: { price: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const productsReport = dbProducts.map((p) => {
      const itemsReport = p.items.map((it) => {
        const skuNum = parseInt(it.sku || "", 10);
        const apiItem = !isNaN(skuNum) ? apiMap.get(skuNum) : null;

        // Determine real-time server readiness
        let serverStatus = "UNKNOWN";
        let isReady = false;
        let note = "";

        if (apiItem) {
          if (apiItem.available === false) {
            serverStatus = "OUT_OF_STOCK";
            isReady = false;
            note = "Server Supplier: available=false";
          } else if (String(it.sku) === "916") {
            // Known upstream outage for MLBB 3 Diamond
            serverStatus = "OUT_OF_STOCK";
            isReady = false;
            note = "Moonton upstream: Nominal ini sementara tidak tersedia";
          } else {
            serverStatus = "READY";
            isReady = true;
            note = "Server Supplier: Normal & Ready";
          }
        } else if (p.categorySlug === "akun-premium") {
          serverStatus = "MANUAL_OR_INSTANT";
          isReady = it.stockStatus === "AVAILABLE";
          note = "Akun Premium (Manual / Reseller Account)";
        } else {
          serverStatus = "CUSTOM";
          isReady = it.stockStatus === "AVAILABLE";
          note = "SKU tidak terdaftar di PPOB";
        }

        return {
          id: it.id,
          name: it.name,
          sku: it.sku,
          dbPrice: it.price,
          supplierPrice: it.supplierPrice || apiItem?.price || null,
          dbStatus: it.stockStatus,
          serverStatus,
          isReady,
          note,
        };
      });

      const totalItems = itemsReport.length;
      const readyCount = itemsReport.filter((i) => i.isReady).length;
      const unreadyCount = totalItems - readyCount;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categorySlug: p.categorySlug,
        totalItems,
        readyCount,
        unreadyCount,
        items: itemsReport,
      };
    });

    const totalDbItems = productsReport.reduce((acc, p) => acc + p.totalItems, 0);
    const totalReady = productsReport.reduce((acc, p) => acc + p.readyCount, 0);
    const totalUnready = productsReport.reduce((acc, p) => acc + p.unreadyCount, 0);

    return NextResponse.json({
      success: true,
      balance: balData.reseller?.balance ?? 0,
      resellerName: balData.reseller?.name ?? "Waroengkuy Reseller",
      totalApiItems: ppobItems.length,
      totalDbItems,
      totalReady,
      totalUnready,
      products: productsReport,
    });
  } catch (err: any) {
    console.error("Gagal get stock report:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal mengambil data stok" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "sync_all";

    const apiKey = process.env.WAROENGKUY_API_KEY || "";
    const baseUrl = (
      process.env.WAROENGKUY_BASE_URL || "https://waroengkuy.com/api/reseller/v1"
    ).replace(/\/$/, "");

    // 1. ACTION: Test specific SKU with server
    if (action === "test_sku") {
      const sku = String(body.sku || "").trim();
      const target = String(body.target || "1215320232610").trim();

      if (!sku) {
        return NextResponse.json(
          { success: false, error: "SKU diperlukan" },
          { status: 400 }
        );
      }

      const variantId = parseInt(sku, 10);
      if (isNaN(variantId)) {
        return NextResponse.json({
          success: false,
          error: "SKU harus berupa angka variant_id Waroengkuy",
        });
      }

      // Check with live order test call
      const res = await fetch(`${baseUrl}/ppob/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          variant_id: variantId,
          target,
          ref_id: "TEST-LIVE-" + Date.now(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: true,
        sku,
        target,
        rawResponse: data,
        isAvailable: data.ok === true || data.status === "processing" || data.status === "success",
      });
    }

    // 2. ACTION: Sync all items stock status from server
    const ppobRes = await fetch(`${baseUrl}/ppob/products`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
    });
    const ppobData = await ppobRes.json().catch(() => ({}));
    const ppobItems: any[] = ppobData.items || [];

    const apiMap = new Map<number, boolean>();
    for (const it of ppobItems) {
      if (it.variant_id) {
        apiMap.set(Number(it.variant_id), it.available === true);
      }
    }

    // Fetch all items from DB
    const allItems = await prisma.productItem.findMany();
    let updatedToOutOfStock = 0;
    let updatedToAvailable = 0;

    for (const it of allItems) {
      const skuNum = parseInt(it.sku || "", 10);
      if (isNaN(skuNum)) continue;

      let isServerAvailable = apiMap.has(skuNum) ? apiMap.get(skuNum)! : false;

      // Special check: Known upstream outage for MLBB 3 Diamond (sku 916)
      if (it.sku === "916") {
        isServerAvailable = false;
      }

      if (!isServerAvailable && it.stockStatus === "AVAILABLE") {
        await prisma.productItem.update({
          where: { id: it.id },
          data: { stockStatus: "OUT_OF_STOCK" },
        });
        updatedToOutOfStock++;
      } else if (isServerAvailable && it.stockStatus === "OUT_OF_STOCK") {
        // If server is now available and was marked out of stock
        await prisma.productItem.update({
          where: { id: it.id },
          data: { stockStatus: "AVAILABLE" },
        });
        updatedToAvailable++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi selesai! ${updatedToOutOfStock} item berhasil diubah menjadi 'Belum tersedia' (OUT_OF_STOCK), dan ${updatedToAvailable} item aktif ready.`,
      updatedToOutOfStock,
      updatedToAvailable,
    });
  } catch (err: any) {
    console.error("Gagal sinkron stok:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal sinkronisasi stok" },
      { status: 500 }
    );
  }
}
