import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
      const logs = await (prisma as any).auditLog.findMany({
        take: 100,
        orderBy: { timestamp: "desc" },
      });
      return NextResponse.json({ success: true, logs });
    } catch {
      // Fallback if AuditLog table has not yet been migrated
      return NextResponse.json({
        success: true,
        logs: [],
        note: "Tabel AuditLog belum dimigrasikan. Jalankan prisma db push untuk mengaktifkan pencatatan permanen.",
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
