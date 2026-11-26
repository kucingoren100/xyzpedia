import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { syncXavieraToDatabase } from "@/lib/xavieraSync";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Sesi admin diperlukan." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const markupPercent = typeof body.markupPercent === "number" ? body.markupPercent : 8;
    const updateSellingPrice = body.updateSellingPrice ?? true;

    const result = await syncXavieraToDatabase({ markupPercent, updateSellingPrice });

    if (result.success) {
      await logAuditEvent({
        actor: session.username || "admin",
        action: "SYNC_PRICES",
        target: "Xaviera Store",
        summary: `Admin melakukan sinkronisasi harga & stok Xaviera: ${result.syncedCount} item berhasil disinkronkan (${result.updatedToAvailable} aktif, ${result.updatedToOutOfStock} stok habis).`,
      });
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    console.error("Admin Xaviera sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menyinkronkan data Xaviera Store." },
      { status: 500 }
    );
  }
}
