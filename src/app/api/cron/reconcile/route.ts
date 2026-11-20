import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/lib/orderStatus";
import { startFulfillment } from "@/lib/orderFulfillment";
import { QiosPayClient } from "@/lib/qiospay";
import { markOrderPaid } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // CRON_SECRET authorization check
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^bearer\s+/i, "").trim();
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    reconciledPending: 0,
    reconciledProcessing: 0,
    reconciledStuckPaid: 0,
  };

  try {
    const now = new Date();

    // 1. Reconcile PENDING orders older than 15 minutes -> Check QiosPay once, else expire
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const expiredPending = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: { lte: fifteenMinutesAgo },
      },
      take: 20,
    });

    const qp = new QiosPayClient();
    for (const order of expiredPending) {
      try {
        const qpStatus = await qp.checkStatus(order.invoiceNumber);
        const data = qpStatus?.raw || qpStatus;
        const status = String(data?.status || qpStatus?.status || "").toUpperCase();
        if (status === "PAID" || status === "SETTLED" || status === "SUCCESS") {
          await markOrderPaid(order.invoiceNumber, "Cron Reconcile", order.totalAmount);
          results.reconciledPending++;
        } else {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.EXPIRED },
          });
          results.reconciledPending++;
        }
      } catch {
        // Expire on failure
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.EXPIRED },
        });
      }
    }

    // 2. Reconcile PAID non-manual orders not started fulfillment for > 2 minutes
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const stuckPaid = await prisma.order.findMany({
      where: {
        status: OrderStatus.PAID,
        paidAt: { lte: twoMinutesAgo },
        fulfillmentStartedAt: null,
      },
      take: 10,
    });

    for (const order of stuckPaid) {
      await startFulfillment(order.id);
      results.reconciledStuckPaid++;
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("[Cron Reconcile] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
