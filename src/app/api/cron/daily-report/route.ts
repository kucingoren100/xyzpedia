import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getNotificationSettings,
  sendTelegramMessage,
  sendEmailMessage,
  formatDailyReportMessage,
  generateDailyReportEmailHtml,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startOfDay } },
      include: { product: true },
    });

    const successOrders = orders.filter(
      (o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "SUCCESS"
    );

    const totalOmset = successOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = Math.round(totalOmset * 0.2);

    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const settings = await getNotificationSettings();

    // 1. Telegram Dispatch
    if (settings.telegram.botToken && settings.telegram.chatId) {
      const msg = formatDailyReportMessage({
        totalOrders: orders.length,
        successOrders: successOrders.length,
        totalOmset,
        totalProfit,
        date: dateStr,
      });
      await sendTelegramMessage(settings.telegram.botToken, settings.telegram.chatId, msg);
    }

    // 2. Email Dispatch
    if (settings.email.recipient) {
      const html = generateDailyReportEmailHtml({
        totalOrders: orders.length,
        successOrders: successOrders.length,
        totalOmset,
        totalProfit,
        date: dateStr,
      });
      await sendEmailMessage(
        settings.email.recipient,
        `Laporan Harian XYZPEDIA - ${dateStr}`,
        html,
        settings.email
      );
    }

    return NextResponse.json({
      success: true,
      message: "Daily report dispatched successfully.",
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
