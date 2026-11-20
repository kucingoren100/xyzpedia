import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

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

    const { id } = await params;
    await prisma.banner.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Banner promo berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
