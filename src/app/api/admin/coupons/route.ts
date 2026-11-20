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

    try {
      const coupons = await (prisma as any).coupon.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, coupons });
    } catch {
      // Return default seed fallback if table not yet migrated
      return NextResponse.json({
        success: true,
        coupons: [
          { code: "XYZPEDIA", type: "percent", value: 30, maxDiscount: 1500, minSpend: 0, active: true },
          { code: "HEMAT5", type: "percent", value: 5, maxDiscount: 5000, minSpend: 0, active: true },
          { code: "NEWUSER", type: "fixed", value: 2000, maxDiscount: 2000, minSpend: 10000, active: true },
        ],
        fallback: true,
      });
    }
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
    const { code, type, value, maxDiscount, minSpend, active } = body;

    if (!code || !value) {
      return NextResponse.json({ success: false, message: "Kode dan nilai diskon wajib diisi." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    try {
      const coupon = await (prisma as any).coupon.upsert({
        where: { code: cleanCode },
        update: {
          type: type || "fixed",
          value: Number(value),
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          minSpend: minSpend ? Number(minSpend) : 0,
          active: active !== undefined ? Boolean(active) : true,
        },
        create: {
          code: cleanCode,
          type: type || "fixed",
          value: Number(value),
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          minSpend: minSpend ? Number(minSpend) : 0,
          active: active !== undefined ? Boolean(active) : true,
        },
      });

      await logAuditEvent({
        actor: session.username,
        action: "save_coupon",
        target: cleanCode,
        summary: `Admin created/updated coupon ${cleanCode}: ${type} ${value}`,
      });

      return NextResponse.json({ success: true, coupon });
    } catch (dbErr: any) {
      return NextResponse.json({
        success: false,
        message: "Tabel Coupon belum termigrasi. Jalankan 'npx prisma db push' untuk menyimpan kupon permanen ke database.",
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
