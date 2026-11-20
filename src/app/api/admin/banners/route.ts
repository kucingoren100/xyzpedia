import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, subtitle, imageUrl, linkUrl, badgeText, order, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "Gambar Banner wajib diisi atau diupload." },
        { status: 400 }
      );
    }

    const cleanTitle = title ? String(title).trim() : `Banner #${Number(order) || 1}`;

    const banner = await prisma.banner.create({
      data: {
        title: cleanTitle,
        subtitle: subtitle ? String(subtitle).trim() : null,
        imageUrl: String(imageUrl).trim(),
        linkUrl: linkUrl ? String(linkUrl).trim() : "/katalog",
        badgeText: badgeText ? String(badgeText).trim().toUpperCase() : null,
        order: Number(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "CREATE_BANNER",
      target: cleanTitle,
      summary: `Admin menambahkan banner promo baru urutan #${banner.order} dengan link ${banner.linkUrl}.`,
    });

    return NextResponse.json({
      success: true,
      message: "Banner promo berhasil ditambahkan.",
      banner,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
