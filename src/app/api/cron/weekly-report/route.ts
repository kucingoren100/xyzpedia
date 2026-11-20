import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getNotificationSettings,
  sendTelegramMessage,
  sendEmailMessage,
  formatWeeklyReportMessage,
  generateWeeklyReportEmailHtml,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: oneWeekAgo } },
      include: { product: true },
    });

    const successOrders = orders.filter(
      (o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "SUCCESS"
    );

    const totalOmset = successOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = Math.round(totalOmset * 0.22);

    const dateRangeStr = `${oneWeekAgo.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })} - ${new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;

    const settings = await getNotificationSettings();

    // 1. Telegram Dispatch
    if (settings.telegram.botToken && settings.telegram.chatId) {
      const msg = formatWeeklyReportMessage({
        totalOrders: orders.length,
        successOrders: successOrders.length,
        totalOmset,
        totalProfit,
        dateRange: dateRangeStr,
      });
      await sendTelegramMessage(settings.telegram.botToken, settings.telegram.chatId, msg);
    }

    // 2. Email Dispatch
    if (settings.email.recipient) {
      const html = generateWeeklyReportEmailHtml({
        totalOrders: orders.length,
        successOrders: successOrders.length,
        totalOmset,
        totalProfit,
        dateRange: dateRangeStr,
        storeName: "XYZPEDIA",
        adminUrl: "/admin",
      });
      await sendEmailMessage(
        settings.email.recipient,
        `Laporan Mingguan XYZPEDIA (${dateRangeStr})`,
        html,
        settings.email
      );
    }

    return NextResponse.json({
      success: true,
      message: "Weekly report dispatched successfully.",
      stats: {
        totalOrders: orders.length,
        successOrders: successOrders.length,
        totalOmset,
        totalProfit,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
