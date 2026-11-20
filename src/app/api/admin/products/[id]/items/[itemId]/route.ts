import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.price !== undefined) updateData.price = parseInt(body.price, 10);
    if (body.supplierPrice !== undefined) {
      updateData.supplierPrice = body.supplierPrice ? parseInt(body.supplierPrice, 10) : 0;
    }
    if (body.originalPrice !== undefined) {
      const orig = body.originalPrice ? parseInt(body.originalPrice, 10) : null;
      updateData.originalPrice = orig;
      const targetPrice = body.price !== undefined ? parseInt(body.price, 10) : undefined;
      if (orig && targetPrice && orig > targetPrice) {
        updateData.discountPercent = Math.round(((orig - targetPrice) / orig) * 100);
      } else if (!orig) {
        updateData.discountPercent = null;
      }
    }
    if (body.discountPercent !== undefined) {
      updateData.discountPercent = body.discountPercent ? parseInt(body.discountPercent, 10) : null;
    }
    if (body.bonusText !== undefined) updateData.bonusText = body.bonusText?.trim() || null;
    if (body.stockStatus !== undefined) updateData.stockStatus = body.stockStatus;

    const updated = await prisma.productItem.update({
      where: { id: itemId },
      data: updateData,
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "UPDATE_PRODUCT_ITEM",
      target: updated.name,
      summary: `Admin mengubah varian "${updated.name}" (Harga: Rp ${updated.price.toLocaleString("id-ID")}, Stok: ${updated.stockStatus}).`,
    });

    return NextResponse.json({
      success: true,
      message: `Varian "${updated.name}" berhasil diupdate.`,
      item: updated,
    });
  } catch (error: any) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui varian item." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const existing = await prisma.productItem.findUnique({
      where: { id: itemId },
      select: { id: true, name: true, sku: true },
    });

    await prisma.productItem.delete({
      where: { id: itemId },
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "DELETE_PRODUCT_ITEM",
      target: existing?.name || itemId,
      summary: `Admin menghapus varian "${existing?.name || itemId}" (SKU: ${existing?.sku || "-"}).`,
    });

    return NextResponse.json({
      success: true,
      message: "Varian item berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus varian item." },
      { status: 500 }
    );
  }
}
