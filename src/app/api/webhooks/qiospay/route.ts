import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QiosPayClient } from "@/lib/qiospay";
import { dispatchNotificationEvent } from "@/lib/notifications";
import { fulfillOrderWithSupplier } from "@/lib/orderFulfillment";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit check: prevent webhook flooding (max 60/min per IP)
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`webhook:qiospay:${clientIp}`, {
      intervalMs: 60_000,
      max: 60,
    });
    if (!rl.success) {
      console.warn(`[QiosPay Webhook] Rate limit exceeded from IP ${clientIp}`);
      return NextResponse.json(
        { error: "Too many webhook requests" },
        { status: 429 }
      );
    }
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-qiospay-signature") ||
      req.headers.get("X-QiosPay-Signature");

    const qp = new QiosPayClient();

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody || "{}");
    } catch {
      payload = {};
    }

    // Handle test/ping event from QiosPay dashboard
    if (payload.event === "ping" || payload.type === "ping") {
      console.log("[QiosPay Webhook] Ping event received successfully.");
      return NextResponse.json({ success: true, message: "pong" });
    }

    const eventData = payload.data || payload;
    const invoiceNumber =
      eventData.ref_id ||
      eventData.order_id ||
      payload.ref_id ||
      payload.order_id;

    // Verify signature – reject immediately if invalid (no bypass allowed)
    const isValid = qp.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn(`[QiosPay Webhook] Invalid signature for invoice: ${invoiceNumber || "unknown"}`);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    if (!invoiceNumber) {
      console.warn("[QiosPay Webhook] Missing ref_id in payload:", payload);
      return NextResponse.json(
        { error: "Missing ref_id / order_id" },
        { status: 400 }
      );
    }

    const rawStatus =
      eventData.status || payload.status || payload.event || "";
    const status = String(rawStatus).toUpperCase();

    const order = await prisma.order.findUnique({
      where: { invoiceNumber },
      include: { product: true, productItem: true },
    });

    if (!order) {
      console.warn(`[QiosPay Webhook] Order not found: ${invoiceNumber}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: Jika pesanan sudah berstatus PAID atau SUCCESS
    if (order.status === "PAID" || order.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Order already processed.",
      });
    }

    const hasExistingSn = !!order.notes && order.notes.includes("SN:");

    if (status === "PAID" || status === "INVOICE.PAID" || status === "SUCCESS") {
      // Amount verification: tolak jika ada selisih lebih dari Rp 1.000 dari total order
      const webhookAmount = Number(eventData.amount || payload.amount || 0);
      if (webhookAmount > 0) {
        const allowedDelta = (order.uniqueCode || 0) + 1000;
        if (Math.abs(webhookAmount - order.totalAmount) > allowedDelta) {
          console.warn(
            `[QiosPay Webhook] Amount mismatch for ${invoiceNumber}: webhook=${webhookAmount}, order=${order.totalAmount}`
          );
          return NextResponse.json(
            { error: "Amount mismatch" },
            { status: 400 }
          );
        }
      }

      // Atomic claim: hanya update jika masih PENDING (mencegah race condition double-fulfillment)
      const claimed = await prisma.order.updateMany({
        where: { invoiceNumber, status: "PENDING" },
        data: {
          status: "PAID",
          paidAt: new Date(),
          ...(hasExistingSn
            ? {}
            : {
                notes: `Settled via QiosPay Webhook at ${new Date().toISOString()}`,
              }),
        },
      });

      if (claimed.count === 0) {
        // Already claimed by another process (race condition)
        console.log(`[QiosPay Webhook] Order ${invoiceNumber} already claimed by concurrent process.`);
        return NextResponse.json({
          success: true,
          message: "Order already being processed.",
        });
      }

      // Reload updated order for fulfillment
      const updatedOrder = await prisma.order.findUniqueOrThrow({
        where: { invoiceNumber },
        include: { product: true, productItem: true },
      });

      console.log(`[QiosPay Webhook] Order ${invoiceNumber} marked as PAID.`);

      // Trigger auto-fulfillment with Digiflazz supplier
      let fulfillResult: any = null;
      try {
        fulfillResult = await fulfillOrderWithSupplier(updatedOrder);
      } catch (fulfillErr) {
        console.error(
          "[QiosPay Webhook] Auto-fulfillment error:",
          fulfillErr
        );
      }

      // Dispatch real-time notifications (Telegram, Email, WhatsApp)
      try {
        const profit = Math.max(
          0,
          updatedOrder.totalAmount -
            (updatedOrder.productItem.supplierPrice ||
              updatedOrder.productItem.price * 0.8)
        );
        await dispatchNotificationEvent("notifySuccessOrder", {
          invoice: updatedOrder.invoiceNumber,
          productName: updatedOrder.product.name,
          variantName: updatedOrder.productItem.name,
          targetUser:
            updatedOrder.targetUserId +
            (updatedOrder.targetZoneId ? ` (${updatedOrder.targetZoneId})` : ""),
          totalAmount: updatedOrder.totalAmount,
          profit: Math.round(profit),
          paymentMethod: updatedOrder.paymentMethod || "QRIS Dinamis (QiosPay)",
          deliveryType:
            (updatedOrder.product as any).deliveryType ||
            (updatedOrder.product.categorySlug === "akun-premium"
              ? "MANUAL"
              : "INSTANT"),
          customerPhone: updatedOrder.customerPhone || undefined,
          customerEmail: updatedOrder.customerEmail || undefined,
          sn: fulfillResult?.sn || "Sedang diproses oleh supplier",
          supplierRef: fulfillResult?.supplierRef,
        });
      } catch (notifErr) {
        console.error("[QiosPay Webhook] Notification dispatch error:", notifErr);
      }

      return NextResponse.json({
        success: true,
        message: "Order marked as PAID and fulfillment triggered.",
      });
    }

    if (status === "EXPIRED" || status === "CANCELLED") {
      // Status guard: only process if still PENDING (never override PAID/SUCCESS)
      await prisma.order.updateMany({
        where: {
          invoiceNumber,
          status: "PENDING",
        },
        data: {
          status: status === "EXPIRED" ? "EXPIRED" : "CANCELLED",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Order marked as ${status}.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Ignored status ${status}`,
    });
  } catch (error: any) {
    console.error("[QiosPay Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}
