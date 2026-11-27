import { NextResponse } from "next/server";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { getWebCondition, saveWebCondition } from "@/lib/webCondition";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const condition = await getWebCondition();
    return NextResponse.json({
      success: true,
      condition,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const body = await req.json();
    const updated = await saveWebCondition(body);

    await logAuditEvent({
      actor: session.username || "admin",
      action: "UPDATE_WEB_CONDITION",
      target: "Status Pemeliharaan Web",
      summary: `Admin memperbarui status website: Full Site Lock ${updated.fullSiteLock ? "AKTIF" : "OFF"}, Payment Maintenance ${updated.paymentMaintenance ? "AKTIF" : "OFF"}, Judul: "${updated.title || "-"}"`,
    });

    return NextResponse.json({
      success: true,
      message: "Kondisi web berhasil diperbarui!",
      condition: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
