import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { checkDigiflazzBalance, getDigiflazzPriceList, createDigiflazzTransaction } from "@/lib/digiflazz";
import { getXavieraBalanceCached } from "@/lib/xaviera";
import { syncXavieraToDatabase } from "@/lib/xavieraSync";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  // Auth guard: only allow authenticated admins
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch Digiflazz & Xaviera balance
    let balance = 0;
    let resellerName = "Digiflazz H2H Partner";
    let xavieraBalance = 0;
    let xavieraResellerName = "Xaviera Store Partner";
    let digiItems: any[] = [];

    try {
      const [digiBal, digiList, xavBal] = await Promise.allSettled([
        checkDigiflazzBalance(),
        getDigiflazzPriceList("prepaid"),
        getXavieraBalanceCached(true),
      ]);

      if (digiBal.status === "fulfilled") {
        balance = digiBal.value;
      }
      if (digiList.status === "fulfilled") {
        digiItems = digiList.value;
      }
      if (xavBal.status === "fulfilled" && typeof xavBal.value === "number") {
        xavieraBalance = xavBal.value;
      }
    } catch (digiErr) {
      console.warn("[Admin Stock] Error fetching balances:", digiErr);
    }

    // Map Digiflazz availability by buyer_sku_code
    const digiMap = new Map<string, any>();
    for (const it of digiItems) {
      if (it.buyer_sku_code) {
        digiMap.set(String(it.buyer_sku_code).toLowerCase(), it);
      }
    }

    // 2. Fetch products and items from database
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
        const skuKey = String(it.sku || "").toLowerCase();
        const digiItem = digiMap.get(skuKey);

        let serverStatus = "UNKNOWN";
        let isReady = false;
        let note = "";

        if (digiItem) {
          const isDigiAvailable = Boolean(digiItem.buyer_product_status && digiItem.seller_product_status);
          serverStatus = isDigiAvailable ? "READY" : "OUT_OF_STOCK";
          isReady = isDigiAvailable;
          note = `Digiflazz H2H (${digiItem.buyer_product_status ? "Buyer Ready" : "Buyer Closed"} | Seller: ${digiItem.seller_product_status ? "Active" : "Closed"})`;
        } else if (p.categorySlug === "akun-premium") {
          serverStatus = "MANUAL_OR_INSTANT";
          isReady = it.stockStatus === "AVAILABLE";
          note = "Akun Premium (Manual / Auto-Fulfillment)";
        } else {
          // Check standard database status
          serverStatus = it.stockStatus === "AVAILABLE" ? "READY" : "OUT_OF_STOCK";
          isReady = it.stockStatus === "AVAILABLE";
          note = it.stockStatus === "AVAILABLE" ? "Database Ready" : "Stok Dinonaktifkan";
        }

        return {
          id: it.id,
          name: it.name,
          sku: it.sku,
          dbPrice: it.price,
          supplierPrice: it.supplierPrice || digiItem?.price || null,
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
      balance,
      resellerName,
      xavieraBalance,
      xavieraResellerName,
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
  // Auth guard: only allow authenticated admins
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "sync_all";

    // 1. ACTION: Test specific SKU with Digiflazz
    if (action === "test_sku") {
      const sku = String(body.sku || "").trim();
      const target = String(body.target || "1215320232610").trim();

      if (!sku) {
        return NextResponse.json(
          { success: false, error: "SKU diperlukan" },
          { status: 400 }
        );
      }

      // Check with live Digiflazz test call
      const res = await createDigiflazzTransaction({
        buyerSkuCode: sku,
        customerNo: target,
        refId: "TEST-SKU-" + Date.now(),
        testing: true,
      });

      return NextResponse.json({
        success: true,
        sku,
        target,
        rawResponse: res.raw,
        isAvailable: res.success || res.status === "PENDING" || res.status === "SUCCESS",
        message: res.message || (res.success ? "SKU Ready dan Valid di Digiflazz" : "Gagal di Digiflazz"),
      });
    }

    // 2. ACTION: Sync all items stock status from Digiflazz & Xaviera
    let digiItems: any[] = [];
    try {
      digiItems = await getDigiflazzPriceList("prepaid");
    } catch (err: any) {
      console.warn("Digiflazz pricelist error during sync:", err.message);
    }

    const digiMap = new Map<string, boolean>();
    for (const it of digiItems) {
      if (it.buyer_sku_code) {
        const isAvail = Boolean(it.buyer_product_status && it.seller_product_status);
        digiMap.set(String(it.buyer_sku_code).toLowerCase(), isAvail);
      }
    }

    // Fetch all items from DB
    const allItems = await prisma.productItem.findMany();
    let updatedToOutOfStock = 0;
    let updatedToAvailable = 0;

    for (const it of allItems) {
      const skuKey = String(it.sku || "").toLowerCase();
      if (!digiMap.has(skuKey)) continue;

      const isServerAvailable = digiMap.get(skuKey)!;

      if (!isServerAvailable && it.stockStatus === "AVAILABLE") {
        await prisma.productItem.update({
          where: { id: it.id },
          data: { stockStatus: "OUT_OF_STOCK" },
        });
        updatedToOutOfStock++;
      } else if (isServerAvailable && it.stockStatus === "OUT_OF_STOCK") {
        await prisma.productItem.update({
          where: { id: it.id },
          data: { stockStatus: "AVAILABLE" },
        });
        updatedToAvailable++;
      }
    }

    // Also sync Xaviera stock status (preserving selling prices)
    let xavResult: any = null;
    try {
      xavResult = await syncXavieraToDatabase({ updateSellingPrice: false });
      if (xavResult?.success) {
        updatedToOutOfStock += xavResult.updatedToOutOfStock || 0;
        updatedToAvailable += xavResult.updatedToAvailable || 0;
      }
    } catch (xavErr: any) {
      console.warn("Xaviera stock sync error:", xavErr.message);
    }

    await logAuditEvent({
      actor: session.username || "admin",
      action: "SYNC_STOCK",
      target: "Digiflazz & Xaviera",
      summary: `Admin menjalankan sinkronisasi stok: total ${updatedToOutOfStock} item dinonaktifkan, ${updatedToAvailable} item diaktifkan kembali.`,
    });

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi stok Digiflazz & Xaviera selesai! ${updatedToOutOfStock} item dinonaktifkan (gangguan/tutup), dan ${updatedToAvailable} item berhasil diaktifkan kembali.`,
      updatedToOutOfStock,
      updatedToAvailable,
      xaviera: xavResult,
    });
  } catch (err: any) {
    console.error("Gagal sinkron stok:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal sinkronisasi stok" },
      { status: 500 }
    );
  }
}
