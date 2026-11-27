import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canAdminMutate, isOwnerRole } from "@/lib/adminAuth";
import { startFulfillment } from "@/lib/orderFulfillment";
import { logAuditEvent } from "@/lib/audit";
import { dispatchNotificationEvent } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Forbidden: Role tidak memiliki akses aksi order." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, sn, notes } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true, productItem: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
    }

    // 1. ACTION: RETRY FULFILLMENT
    if (action === "retry") {
      if (order.status !== "FAILED" && order.status !== "PAID") {
        return NextResponse.json({
          success: false,
          message: `Tidak dapat mengirim ulang pesanan dengan status ${order.status}. Hanya status FAILED atau PAID yang dapat di-retry.`,
        }, { status: 400 });
      }

      await logAuditEvent({
        actor: session.username,
        action: "order_retry_fulfillment",
        target: order.invoiceNumber,
        summary: `Admin dipicu fulfillment ulang untuk #${order.invoiceNumber}`,
      });

      // Reset fulfillment lock and run fulfillment
      await (prisma.order as any).update({
        where: { id: order.id },
        data: {
          status: "PAID",
          fulfillmentStartedAt: null,
          fulfillmentError: null,
        },
      });

      const res = await startFulfillment(order.id);
      return NextResponse.json({
        success: true,
        message: `Fulfillment ulang diproses: hasil ${res.status}`,
        result: res,
      });
    }

    // 2. ACTION: COMPLETE MANUAL
    if (action === "complete_manual") {
      if (!isOwnerRole(session) && order.status === "PENDING") {
        return NextResponse.json(
          { success: false, message: "Hanya OWNER yang dapat menyelesaikan manual pesanan yang belum terbayar." },
          { status: 403 }
        );
      }
      const serialNumber = sn?.trim() || `MANUAL-${Date.now()}`;
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "SUCCESS",
          fulfilledAt: new Date(),
          sn: serialNumber,
          notes: notes ? String(notes).slice(0, 300) : order.notes,
        } as any,
      });

      await logAuditEvent({
        actor: session.username,
        action: "order_complete_manual",
        target: order.invoiceNumber,
        summary: `Admin menyelesaikan pesanan manual #${order.invoiceNumber} (SN: ${serialNumber})`,
      });

      // Dispatch notification & buyer receipt email for manually completed order
      try {
        const profit = Math.max(
          0,
          updated.totalAmount - (order.productItem.supplierPrice || order.productItem.price * 0.8)
        );
        await dispatchNotificationEvent("notifySuccessOrder", {
          invoice: updated.invoiceNumber,
          productName: order.product.name,
          variantName: order.productItem.name,
          targetUser: updated.targetUserId + (updated.targetZoneId ? ` (${updated.targetZoneId})` : ""),
          totalAmount: updated.totalAmount,
          profit: Math.round(profit),
          paymentMethod: updated.paymentMethod || "QRIS",
          deliveryType: "MANUAL",
          customerPhone: updated.customerPhone || undefined,
          customerEmail: updated.customerEmail || undefined,
          sn: serialNumber,
        });
      } catch (notifErr) {
        console.error("[complete_manual] Notification dispatch error:", notifErr);
      }

      return NextResponse.json({
        success: true,
        message: `Pesanan #${order.invoiceNumber} ditandai SUKSES secara manual.`,
        order: updated,
      });
    }

    // 3. ACTION: REFUND
    if (action === "refund") {
      const { canTransition } = await import("@/lib/orderStatus");
      if (!canTransition(order.status, "REFUNDED") && session.role !== "OWNER") {
        return NextResponse.json({
          success: false,
          message: `Transisi dari ${order.status} ke REFUNDED tidak diizinkan tanpa persetujuan OWNER.`,
        }, { status: 403 });
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          notes: notes ? `REFUND: ${notes}` : order.notes,
        },
      });

      await logAuditEvent({
        actor: session.username,
        action: "order_refunded",
        target: order.invoiceNumber,
        summary: `Admin mencatat REFUND untuk #${order.invoiceNumber}`,
      });

      return NextResponse.json({
        success: true,
        message: `Pesanan #${order.invoiceNumber} berhasil dicatat sebagai REFUNDED.`,
        order: updated,
      });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenali." }, { status: 400 });
  } catch (error: any) {
    console.error("Order action error:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal memproses aksi pesanan." }, { status: 500 });
  }
}
