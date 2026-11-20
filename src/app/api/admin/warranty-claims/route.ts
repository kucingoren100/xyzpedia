import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.status = status;
    }

    const claims = await prisma.warrantyClaim.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const invoiceNumbers = Array.from(new Set(claims.map((c) => c.invoiceNumber)));
    const orders = await prisma.order.findMany({
      where: { invoiceNumber: { in: invoiceNumbers } },
      include: {
        product: {
          select: { name: true, slug: true, categorySlug: true },
        },
        productItem: {
          select: { name: true },
        },
      },
    });

    const orderMap = new Map(orders.map((o) => [o.invoiceNumber, o]));

    const enrichedClaims = claims.map((claim) => ({
      ...claim,
      order: orderMap.get(claim.invoiceNumber) || null,
    }));

    return NextResponse.json({ success: true, claims: enrichedClaims });
  } catch (error: any) {
    console.error("[API ADMIN WARRANTY CLAIMS GET] Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID klaim dan status wajib diisi." },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Status tidak valid." }, { status: 400 });
    }

    const existing = await prisma.warrantyClaim.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data klaim tidak ditemukan." },
        { status: 404 }
      );
    }

    const isResolvedOrRejected = status === "RESOLVED" || status === "REJECTED";

    const updated = await prisma.warrantyClaim.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes !== undefined ? String(adminNotes) : existing.adminNotes,
        resolvedAt: isResolvedOrRejected ? new Date() : null,
      },
    });

    await logAuditEvent({
      actor: session.username,
      action: "update_warranty_claim",
      target: id,
      summary: `Mengubah status klaim ${id} (Invoice: ${existing.invoiceNumber}) menjadi ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: "Status klaim garansi berhasil diperbarui.",
      claim: updated,
    });
  } catch (error: any) {
    console.error("[API ADMIN WARRANTY CLAIMS PATCH] Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
