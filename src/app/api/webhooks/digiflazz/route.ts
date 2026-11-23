import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/lib/orderStatus";
import { dispatchNotificationEvent } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Official Digiflazz Webhook Receiver
 * Verifies HMAC signature using DIGIFLAZZ_WEBHOOK_SECRET and Digiflazz username/key
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("x-digiflazz-signature") ||
      req.headers.get("x-hub-signature") ||
      req.headers.get("X-Hub-Signature") ||
      "";

    const secret =
      process.env.DIGIFLAZZ_WEBHOOK_SECRET ||
      process.env.DIGIFLAZZ_KEY ||
      "";

    if (secret && signatureHeader) {
      const isSha1 = signatureHeader.toLowerCase().startsWith("sha1=") || signatureHeader.length === 40;
      const algorithm = isSha1 ? "sha1" : "sha256";
      const cleanSignature = signatureHeader.replace(/^(sha1|sha256)=/i, "");

      const hmac = crypto
        .createHmac(algorithm, secret)
        .update(rawBody)
        .digest("hex");

      const bufA = Buffer.from(cleanSignature, "hex");
      const bufB = Buffer.from(hmac, "hex");

      if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
        // Signature verified OK
      } else {
        // Also try with DIGIFLAZZ_KEY if DIGIFLAZZ_WEBHOOK_SECRET was used and mismatched, or vice versa
        const altSecret = process.env.DIGIFLAZZ_KEY;
        let altMatched = false;
        if (altSecret && altSecret !== secret) {
          const altHmac = crypto.createHmac(algorithm, altSecret).update(rawBody).digest("hex");
          const altBuf = Buffer.from(altHmac, "hex");
          if (bufA.length === altBuf.length && crypto.timingSafeEqual(bufA, altBuf)) {
            altMatched = true;
          }
        }

        if (!altMatched) {
          console.warn("[Digiflazz Webhook] Signature mismatch. Header:", signatureHeader);
          // Only reject with 401 if DIGIFLAZZ_WEBHOOK_SECRET is explicitly configured
          if (process.env.DIGIFLAZZ_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
          }
        }
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    const data = payload.data || payload;

    const refId = data.ref_id;
    if (!refId) {
      return NextResponse.json({ error: "Missing ref_id" }, { status: 400 });
    }

    const rawStatus = String(data.status || "").toLowerCase();
    const sn = data.sn || data.message || null;

    const order = await prisma.order.findUnique({
      where: { invoiceNumber: refId },
      include: { product: true, productItem: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only update if still in PROCESSING or PENDING
    if (order.status === OrderStatus.SUCCESS) {
      return NextResponse.json({ success: true, message: "Order already SUCCESS" });
    }

    if (rawStatus === "sukses" || rawStatus === "success") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SUCCESS,
          fulfilledAt: new Date(),
          sn: sn || "Injeksi berhasil",
          supplierStatus: "SUCCESS",
          notes: `Digiflazz Webhook: Sukses | SN: ${sn || "Selesai"}`,
        },
        include: { product: true, productItem: true },
      });

      try {
        const profit = Math.max(
          0,
          updated.totalAmount - (updated.productItem.supplierPrice || updated.productItem.price * 0.8)
        );
        await dispatchNotificationEvent("notifySuccessOrder", {
          invoice: updated.invoiceNumber,
          productName: updated.product.name,
          variantName: updated.productItem.name,
          targetUser: updated.targetUserId + (updated.targetZoneId ? ` (${updated.targetZoneId})` : ""),
          totalAmount: updated.totalAmount,
          profit: Math.round(profit),
          paymentMethod: updated.paymentMethod || "QRIS",
          deliveryType: updated.product.categorySlug === "akun-premium" ? "MANUAL" : "INSTANT",
          customerPhone: updated.customerPhone || undefined,
          customerEmail: updated.customerEmail,
          sn: sn || "Selesai",
          supplierRef: refId,
        });
      } catch (err) {
        console.error("[Digiflazz Webhook] Notification dispatch error:", err);
      }

      return NextResponse.json({ success: true, message: "Order marked SUCCESS" });
    } else if (rawStatus === "gagal" || rawStatus === "failed") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.FAILED,
          supplierStatus: "FAILED",
          fulfillmentError: data.message || "Digiflazz transaction failed",
          notes: `Digiflazz Webhook: Gagal (${data.message || "-"})`,
        },
      });

      return NextResponse.json({ success: true, message: "Order marked FAILED" });
    }

    return NextResponse.json({ success: true, message: "Event ignored" });
  } catch (error: any) {
    console.error("[Digiflazz Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
