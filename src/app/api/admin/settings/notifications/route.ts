import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const settings = await getNotificationSettings();
    return NextResponse.json({
      success: true,
      settings,
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
    const updated = await saveNotificationSettings(body);

    return NextResponse.json({
      success: true,
      message: "Pengaturan notifikasi berhasil disimpan!",
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
