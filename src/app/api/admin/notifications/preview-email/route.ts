import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import {
  generateWeeklyReportEmailHtml,
  generateNewOrderEmailHtml,
  generateSuccessOrderEmailHtml,
  generateFailedOrderEmailHtml,
  generateDailyReportEmailHtml,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Auth guard: only allow authenticated admins
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "weekly";
    const profitParam = searchParams.get("profit");
    const omsetParam = searchParams.get("omset");

    let rawHtml = "";

    if (type === "new_order") {
      rawHtml = generateNewOrderEmailHtml({
        invoice: "XYZ-PREVIEW-001",
        productName: "Mobile Legends: Bang Bang",
        variantName: "86 Diamonds (+Garansi Pengiriman)",
        targetUser: "12345678 (Zone 2041)",
        customerPhone: "081234567890",
        customerEmail: "pembeli@gmail.com",
        totalAmount: 21500,
        paymentMethod: "QRIS Real-time Dinamis",
      });
    } else if (type === "success_order") {
      rawHtml = generateSuccessOrderEmailHtml({
        invoice: "XYZ-PREVIEW-002",
        productName: "Arena Breakout",
        variantName: "Pilihan Pemula (Special Offer)",
        targetUser: "PlayerOne#8821",
        customerPhone: "081298765432",
        totalAmount: 14500,
        profit: 1740,
        paymentMethod: "QRIS Terverifikasi",
        deliveryType: "INSTANT",
      });
    } else if (type === "failed_order") {
      rawHtml = generateFailedOrderEmailHtml({
        invoice: "XYZ-PREVIEW-003",
        productName: "Alight Motion Pro",
        variantName: "1 Tahun Sharing (Manual)",
        totalAmount: 12500,
        reason: "Timeout server supplier saat pengiriman lisensi akun",
        customerPhone: "081211223344",
      });
    } else if (type === "daily") {
      rawHtml = generateDailyReportEmailHtml({
        date: new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        totalOrders: 14,
        successOrders: 12,
        totalOmset: 185000,
        totalProfit: 32500,
        topProduct: "Free Fire 140 Diamonds",
      });
    } else {
      // Default: Weekly Report
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentOrders = await prisma.order.findMany({
        where: { createdAt: { gte: oneWeekAgo } },
        include: { product: true, productItem: true },
      });

      const successOrdersList = recentOrders.filter(
        (o) => o.status === "PAID" || o.status === "SUCCESS"
      );

      const totalOrders = Math.max(recentOrders.length, 2);
      const successOrders = Math.max(successOrdersList.length, 2);
      const totalOmset = omsetParam
        ? Number(omsetParam)
        : successOrdersList.length > 0
        ? successOrdersList.reduce((acc, o) => acc + o.totalAmount, 0)
        : 45500;
      const totalProfit = profitParam
        ? Number(profitParam)
        : successOrdersList.length > 0
        ? Math.round(totalOmset * 0.24)
        : 10950;

      const topProd = successOrdersList[0]?.product?.name || "Canva Pro — 1 Tahun";

      const dateRangeStr = `${oneWeekAgo.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })} - ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;

      rawHtml = generateWeeklyReportEmailHtml({
        totalOrders,
        successOrders,
        totalOmset,
        totalProfit,
        dateRange: `${dateRangeStr} (DATA CONTOH)`,
        conversionRate: totalOrders > 0 ? ((successOrders / totalOrders) * 100).toFixed(1) : undefined,
        topProduct: `${topProd} (CONTOH)`,
        storeName: "XYZPEDIA (CONTOH PREVIEW)",
        adminUrl: "/admin",
      });
    }

    // Inject Pop-Brutalist floating selector banner for seamless template navigation
    const navBar = `
    <div style="background-color: #000000; padding: 10px 16px; border-bottom: 3px solid #ffd731; position: sticky; top: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
      <span style="color: #ffd731; font-size: 11px; font-weight: 900; text-transform: uppercase; margin-right: 6px;">
        👁 PREVIEW EMAIL TEMPLATE:
      </span>
      <a href="?type=weekly" style="padding: 5px 12px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 800; ${
        type === "weekly"
          ? "background: #ffd731; color: #000; border: 1.5px solid #fff;"
          : "background: #27272a; color: #e4e4e7; border: 1.5px solid #3f3f46;"
      }">📊 Rekap Mingguan</a>
      <a href="?type=new_order" style="padding: 5px 12px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 800; ${
        type === "new_order"
          ? "background: #ffd731; color: #000; border: 1.5px solid #fff;"
          : "background: #27272a; color: #e4e4e7; border: 1.5px solid #3f3f46;"
      }">🔔 Pesanan Baru (Pending)</a>
      <a href="?type=success_order" style="padding: 5px 12px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 800; ${
        type === "success_order"
          ? "background: #ffd731; color: #000; border: 1.5px solid #fff;"
          : "background: #27272a; color: #e4e4e7; border: 1.5px solid #3f3f46;"
      }">✅ Pembayaran Lunas (PAID)</a>
      <a href="?type=failed_order" style="padding: 5px 12px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 800; ${
        type === "failed_order"
          ? "background: #ffd731; color: #000; border: 1.5px solid #fff;"
          : "background: #27272a; color: #e4e4e7; border: 1.5px solid #3f3f46;"
      }">🚨 Transaksi Gagal</a>
      <a href="?type=daily" style="padding: 5px 12px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: 800; ${
        type === "daily"
          ? "background: #ffd731; color: #000; border: 1.5px solid #fff;"
          : "background: #27272a; color: #e4e4e7; border: 1.5px solid #3f3f46;"
      }">🌙 Rekap Harian</a>
    </div>`;

    const finalHtml = rawHtml.replace("<body", `${navBar}<body`);

    return new Response(finalHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
