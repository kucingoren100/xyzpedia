import { NextResponse } from "next/server";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { syncDigiflazzToDatabase } from "@/lib/digiflazzSync";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }
    if (!canAdminMutate(session)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const markupPercent = typeof body.markupPercent === "number" ? body.markupPercent : 8;
    const updateSellingPrice = body.updateSellingPrice ?? false;

    const result = await syncDigiflazzToDatabase({ markupPercent, updateSellingPrice });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    console.error("Admin Digiflazz sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menyinkronkan data Digiflazz." },
      { status: 500 }
    );
  }
}
