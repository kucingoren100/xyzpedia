import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WaroengPayClient } from "@/lib/waroengpay";
import { dispatchNotificationEvent } from "@/lib/notifications";
import { fulfillOrderWithSupplier } from "@/lib/orderFulfillment";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || req.headers.get("X-Signature");
    const timestamp =
      req.headers.get("x-waroengpay-timestamp") ||
      req.headers.get("X-WaroengPay-Timestamp") ||
      req.headers.get("x-timestamp");

    const wp = new WaroengPayClient();
    const secret = process.env.WAROENGPAY_WEBHOOK_SECRET;

    const payload = JSON.parse(rawBody || "{}");
    const eventData = payload.data || payload;
    const invoiceNumber =
      eventData.reference ||
      eventData.order_id ||
      eventData.order_number ||
      payload.reference ||
      payload.order_id ||
      payload.order_number;

    const rawStatus = eventData.status || payload.status || payload.event || "";
    const status = String(rawStatus).toUpperCase();

    // Verify signature if secret is configured
    if (secret) {
      const isValid = wp.verifyWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        // Fallback safety check: verify directly with WaroengPay API before rejecting
        if (invoiceNumber) {
          const directCheck = await wp.checkStatus(invoiceNumber);
          if (directCheck.success && directCheck.status === "PAID") {
            console.log(`[WaroengPay Webhook] Signature check bypassed via verified API status for ${invoiceNumber}`);
          } else {
            console.warn("WaroengPay Webhook signature mismatch and API check failed.");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
          }
        } else {
          console.warn("WaroengPay Webhook signature mismatch.");
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
      }
    }

    if (!invoiceNumber) {
      console.warn("[WaroengPay Webhook] Missing reference in payload:", payload);
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const isPaid =
      status === "PAID" ||
      status === "SETTLED" ||
      status === "SUCCESS" ||
      status === "COMPLETED" ||
      status === "PAYMENT.PAID";

    if (isPaid) {
      const existingOrder = await prisma.order.findUnique({
        where: { invoiceNumber },
      });
      const hasExistingSn = existingOrder?.notes?.includes("SN:");

      await prisma.order.updateMany({
        where: { invoiceNumber },
        data: {
          status: "SUCCESS",
          paidAt: existingOrder?.paidAt || new Date(),
          fulfilledAt: existingOrder?.fulfilledAt || new Date(),
          ...(hasExistingSn ? {} : { notes: `Settled via WaroengPay Webhook at ${new Date().toISOString()}` }),
        },
      });
      console.log(`[WaroengPay Webhook] Order ${invoiceNumber} marked as SUCCESS.`);

      // Dispatch Telegram / Email notifications & fulfill order
      try {
        const order = await prisma.order.findUnique({
          where: { invoiceNumber },
          include: { product: true, productItem: true },
        });

        if (order) {
          // 1. Trigger automated fulfillment to supplier API (Games / Pulsa / E-Wallet / Voucher)
          let fulfillResult: any = null;
          try {
            fulfillResult = await fulfillOrderWithSupplier(order);
          } catch (fulfillErr) {
            console.error("[WaroengPay Webhook] Auto-fulfillment error:", fulfillErr);
          }

          const target = order.targetUserId + (order.targetZoneId ? ` (${order.targetZoneId})` : "");
          const profit = Math.max(
            0,
            order.totalAmount - (order.productItem.supplierPrice || order.productItem.price * 0.8)
          );
          await dispatchNotificationEvent("notifySuccessOrder", {
            invoice: order.invoiceNumber,
            productName: order.product.name,
            variantName: order.productItem.name,
            targetUser: target,
            totalAmount: order.totalAmount,
            profit: Math.round(profit),
            paymentMethod: order.paymentMethod || "QRIS Real-time",
            deliveryType: (order.product as any).deliveryType || (order.product.categorySlug === "akun-premium" ? "MANUAL" : "INSTANT"),
            customerPhone: order.customerPhone || undefined,
            customerEmail: order.customerEmail || undefined,
            sn: fulfillResult?.sn || "Sedang diverifikasi oleh publisher",
            supplierRef: fulfillResult?.supplierRef,
          });
        }
      } catch (notifErr) {
        console.error("Gagal dispatch notifikasi webhook:", notifErr);
      }
    } else if (status === "EXPIRED" || status === "CANCELLED" || status === "FAILED") {
      await prisma.order.updateMany({
        where: { invoiceNumber, status: "PENDING" },
        data: {
          status: "FAILED",
        },
      });
      console.log(`[WaroengPay Webhook] Order ${invoiceNumber} marked as ${status}.`);

      // Dispatch Telegram / Email alert for failed order
      try {
        const order = await prisma.order.findUnique({
          where: { invoiceNumber },
          include: { product: true, productItem: true },
        });
        if (order) {
          await dispatchNotificationEvent("notifyFailedOrder", {
            invoice: order.invoiceNumber,
            productName: order.product.name,
            variantName: order.productItem.name,
            totalAmount: order.totalAmount,
            reason: `Status pembayaran ${status} dari WaroengPay`,
            customerPhone: order.customerPhone || undefined,
          });
        }
      } catch (err) {
        console.error("Gagal dispatch notif failed order webhook:", err);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("WaroengPay Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
