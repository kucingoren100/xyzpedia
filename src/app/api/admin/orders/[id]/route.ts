import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        productItem: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail pesanan." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, notes, sn } = body;

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { product: true, productItem: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      const { canTransition } = await import("@/lib/orderStatus");
      const isOwner = session.role === "OWNER";
      const validTransition = canTransition(currentOrder.status, status);

      if (!validTransition && !isOwner) {
        return NextResponse.json(
          {
            success: false,
            message: `Transisi status tidak valid dari ${currentOrder.status} ke ${status}. Hanya OWNER yang dapat melakukan override manual.`,
          },
          { status: 403 }
        );
      }

      updateData.status = status;
      if (status === "PAID" || status === "PROCESSING" || status === "SUCCESS") {
        updateData.paidAt = currentOrder.paidAt || new Date();
      }
      if (status === "SUCCESS") {
        updateData.fulfilledAt = currentOrder.fulfilledAt || new Date();
      }
    }

    if (sn !== undefined) {
      updateData.sn = sn;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        product: { select: { name: true, slug: true } },
        productItem: { select: { name: true, sku: true } },
      },
    });

    await logAuditEvent({
      actor: session.username,
      action: "order_update",
      target: updatedOrder.invoiceNumber,
      summary: `Admin updated order #${updatedOrder.invoiceNumber}: Status ${currentOrder.status} -> ${updatedOrder.status}${sn ? ` with SN: ${sn}` : ""}`,
    });

    return NextResponse.json({
      success: true,
      message: `Status pesanan #${updatedOrder.invoiceNumber} berhasil diubah ke ${updatedOrder.status}.`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status pesanan." },
      { status: 500 }
    );
  }
}
