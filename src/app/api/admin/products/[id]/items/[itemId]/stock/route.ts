import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;

    const stocks = await prisma.accountStock.findMany({
      where: { productItemId: itemId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        credential: true,
        isUsed: true,
        orderId: true,
        usedAt: true,
        createdAt: true,
      },
    });

    const availableCount = stocks.filter((s) => !s.isUsed).length;
    const usedCount = stocks.filter((s) => s.isUsed).length;

    return NextResponse.json({
      success: true,
      stocks,
      availableCount,
      usedCount,
      totalCount: stocks.length,
    });
  } catch (error: any) {
    console.error("Get stock error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data stok kredensial." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const { id: productId, itemId } = await params;
    const body = await req.json();
    const rawCreds = String(body.credentials || "").trim();

    const credLines = rawCreds
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (credLines.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kredensial akun tidak boleh kosong." },
        { status: 400 }
      );
    }

    await prisma.accountStock.createMany({
      data: credLines.map((cred) => ({
        productItemId: itemId,
        credential: cred,
        isUsed: false,
      })),
    });

    // Automatically ensure variant status is AVAILABLE
    await prisma.productItem.update({
      where: { id: itemId },
      data: { stockStatus: "AVAILABLE", supplier: "MANUAL" },
    });

    const currentAvailable = await prisma.accountStock.count({
      where: { productItemId: itemId, isUsed: false },
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "RESTOCK_ACCOUNT_ITEM",
      target: itemId,
      summary: `Admin menambahkan ${credLines.length} akun stok baru ke varian ID ${itemId}. Total stok tersedia: ${currentAvailable}.`,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${credLines.length} akun stok ke brankas.`,
      addedCount: credLines.length,
      availableCount: currentAvailable,
    });
  } catch (error: any) {
    console.error("Add stock error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan stok akun." },
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
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const { itemId } = await params;
    const { searchParams } = new URL(req.url);
    const stockId = searchParams.get("stockId");

    if (!stockId) {
      return NextResponse.json(
        { success: false, message: "ID stok akun wajib disertakan." },
        { status: 400 }
      );
    }

    // Only allow deleting unused stock accounts
    await prisma.accountStock.delete({
      where: { id: stockId, productItemId: itemId, isUsed: false },
    });

    const remainingAvailable = await prisma.accountStock.count({
      where: { productItemId: itemId, isUsed: false },
    });

    if (remainingAvailable === 0) {
      await prisma.productItem.update({
        where: { id: itemId },
        data: { stockStatus: "OUT_OF_STOCK" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Akun stok berhasil dihapus dari brankas.",
      availableCount: remainingAvailable,
    });
  } catch (error: any) {
    console.error("Delete stock item error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus stok akun (mungkin akun sudah terpakai)." },
      { status: 500 }
    );
  }
}
