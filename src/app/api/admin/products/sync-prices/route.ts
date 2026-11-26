import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { syncDigiflazzToDatabase } from "@/lib/digiflazzSync";
import { syncXavieraToDatabase } from "@/lib/xavieraSync";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            items: true,
          },
        },
      },
    });

    const dbSummary = categories.map((c) => {
      const allItems = c.products.flatMap((p) => p.items);
      const digiCount = allItems.filter((i) => i.supplier === "DIGIFLAZZ").length;
      const xavCount = allItems.filter((i) => i.supplier === "XAVIERA").length;
      const manualCount = allItems.filter((i) => i.supplier === "MANUAL" || (!i.supplier && c.slug === "akun-premium")).length;
      const unsyncedCount = allItems.filter((i) => !i.supplierPrice || i.supplierPrice === 0).length;

      return {
        categorySlug: c.slug,
        categoryName: c.name,
        productCount: c.products.length,
        itemCount: allItems.length,
        digiCount,
        xavCount,
        manualCount,
        unsyncedCount,
      };
    });

    const allProducts = categories.flatMap((c) => c.products);
    const unsyncedProducts = allProducts
      .map((p) => {
        const count = p.items.filter((pi) => !pi.supplierPrice || pi.supplierPrice === 0).length;
        return {
          prodName: p.name,
          categorySlug: p.categorySlug,
          count,
        };
      })
      .filter((u) => u.count > 0);

    return NextResponse.json({
      success: true,
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
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = req ? await req.json().catch(() => ({})) : {};
    const provider = String(body?.provider || "all").toLowerCase();
    const markupPercent = typeof body?.markupPercent === "number" ? body.markupPercent : 8;
    const updateSellingPrice = body?.updateSellingPrice ?? false;

    let digiResult: any = null;
    let xavResult: any = null;

    if (provider === "all" || provider === "digiflazz") {
      try {
        digiResult = await syncDigiflazzToDatabase({ markupPercent, updateSellingPrice });
      } catch (err: any) {
        digiResult = { success: false, message: err.message, syncedCount: 0 };
      }
    }

    if (provider === "all" || provider === "xaviera") {
      try {
        xavResult = await syncXavieraToDatabase({ markupPercent, updateSellingPrice });
      } catch (err: any) {
        xavResult = { success: false, message: err.message, syncedCount: 0 };
      }
    }

    const totalSynced = (digiResult?.syncedCount || 0) + (xavResult?.syncedCount || 0);

    await logAuditEvent({
      actor: session.username || "admin",
      action: "SYNC_PRICES",
      target: provider === "all" ? "Digiflazz & Xaviera" : provider.toUpperCase(),
      summary: `Admin menjalankan sinkronisasi harga supplier (${provider}): total ${totalSynced} varian berhasil disinkronkan.`,
    });

    const messages: string[] = [];
    if (digiResult) {
      messages.push(`Digiflazz: ${digiResult.syncedCount ?? 0} item (${digiResult.message})`);
    }
    if (xavResult) {
      messages.push(`Xaviera: ${xavResult.syncedCount ?? 0} item (${xavResult.message})`);
    }

    return NextResponse.json({
      success: (digiResult?.success ?? true) && (xavResult?.success ?? true),
      totalSynced,
      digiflazz: digiResult,
      xaviera: xavResult,
      message: messages.join(" | ") || `Berhasil menyinkronkan ${totalSynced} produk.`,
    });
  } catch (error: any) {
    console.error("Sync prices error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal sinkronisasi harga supplier." },
      { status: 500 }
    );
  }
}
