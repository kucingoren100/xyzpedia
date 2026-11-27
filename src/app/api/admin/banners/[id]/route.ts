import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

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

    const allowed = ["title", "subtitle", "imageUrl", "linkUrl", "badgeText", "order", "isActive"];
    const updateData: any = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "order") updateData[key] = Number(body[key]);
        else if (key === "isActive") updateData[key] = Boolean(body[key]);
        else updateData[key] = String(body[key]).trim();
      }
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "UPDATE_BANNER",
      target: updated.title,
      summary: `Admin mengubah data/status banner "${updated.title}" (${updated.isActive ? "ONLINE" : "NONAKTIF"}).`,
    });

    return NextResponse.json({
      success: true,
      message: "Banner berhasil diperbarui.",
      banner: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
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
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.banner.findUnique({
      where: { id },
      select: { id: true, title: true, order: true },
    });

    await prisma.banner.delete({ where: { id } });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "DELETE_BANNER",
      target: existing?.title || id,
      summary: `Admin menghapus banner "${existing?.title || id}" (Urutan #${existing?.order || "-"}).`,
    });

    return NextResponse.json({
      success: true,
      message: "Banner promo berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
