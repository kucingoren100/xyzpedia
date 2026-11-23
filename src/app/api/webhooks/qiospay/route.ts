import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QiosPayClient } from "@/lib/qiospay";
import { markOrderPaid, OrderStatus } from "@/lib/orderStatus";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    if (payload.event === "ping" || payload.type === "ping") {
      return NextResponse.json({ success: true, message: "pong" });
    }

    const eventData = payload.data || payload;
    const invoiceNumber =
      eventData.ref_id ||
      eventData.order_id ||
      payload.ref_id ||
      payload.order_id;

    // Strict signature check
    const isValid = qp.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn(`[QiosPay Webhook] Invalid signature for invoice: ${invoiceNumber || "unknown"}`);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: "Missing ref_id / order_id" },
        { status: 400 }
      );
    }

    const rawStatus =
      eventData.status || payload.status || payload.event || "";
    const status = String(rawStatus).toUpperCase();

    if (status === "PAID" || status === "INVOICE.PAID" || status === "SUCCESS") {
      const webhookAmount = Number(
        eventData.total_amount ??
        eventData.totalAmount ??
        eventData.paid_amount ??
        eventData.amount ??
        payload.total_amount ??
        payload.amount ??
        0
      );
      if (!webhookAmount || webhookAmount <= 0) {
        return NextResponse.json(
          { error: "Missing or invalid amount in payload" },
          { status: 400 }
        );
      }

      const res = await markOrderPaid(invoiceNumber, "QiosPay Webhook", webhookAmount);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Order marked as PAID and fulfillment triggered.",
      });
    }

    if (status === "EXPIRED" || status === "CANCELLED") {
      await prisma.order.updateMany({
        where: {
          invoiceNumber,
          status: OrderStatus.PENDING,
        },
        data: {
          status: status === "EXPIRED" ? OrderStatus.EXPIRED : OrderStatus.CANCELLED,
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
    // Redact internal error details from public response
    console.error("[QiosPay Webhook] Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
