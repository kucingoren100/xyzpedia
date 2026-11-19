import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { getWebCondition, saveWebCondition } from "@/lib/webCondition";

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

    const body = await req.json();
    const updated = await saveWebCondition(body);

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
