import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "isActive",
      "isPopular",
      "name",
      "tagline",
      "description",
      "developer",
      "categorySlug",
      "thumbnailUrl",
      "bannerUrl",
      "badgeText",
      "badgeColor",
      "requiresServer",
      "targetInputLabel",
      "targetInputPlaceholder",
      "serverInputPlaceholder",
      "instructions",
      "importantNotice",
      "warrantyTerms",
      "additionalNotes",
    ];

    const dataToUpdate: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        dataToUpdate[field] = body[field];
      }
    }

    if (body.targetInputLabel !== undefined) {
      const cleanLabel = String(body.targetInputLabel).trim();
      dataToUpdate.targetInputLabel = cleanLabel;
      if (!body.targetInputPlaceholder) {
        dataToUpdate.targetInputPlaceholder =
          cleanLabel.toLowerCase() !== "user id"
            ? `Masukkan ${cleanLabel}`
            : "Masukkan User ID akun Anda";
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: { select: { name: true, slug: true } },
        items: true,
      },
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "UPDATE_PRODUCT",
      target: updated.name,
      summary: `Admin memperbarui data produk "${updated.name}" (${updated.isActive ? "ONLINE" : "OFFLINE"}).`,
    });

    return NextResponse.json({
      success: true,
      message: `Produk "${updated.name}" berhasil diperbarui.`,
      product: updated,
    });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui produk: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Produk tidak ditemukan." }, { status: 404 });
    }

    // Clean transaction delete: remove associated orders & items first to prevent FK constraint failures
    await prisma.$transaction(async (tx) => {
      await tx.order.deleteMany({ where: { productId: id } });
      await tx.productItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "DELETE_PRODUCT",
      target: existing.name,
      summary: `Admin menghapus permanen produk "${existing.name}" (ID: ${id}) berserta seluruh varian dan relasinya.`,
    });

    return NextResponse.json({
      success: true,
      message: `Produk "${existing.name}" berhasil dihapus permanen dari sistem.`,
    });
  } catch (error: any) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus produk: " + error.message },
      { status: 500 }
    );
  }
}
