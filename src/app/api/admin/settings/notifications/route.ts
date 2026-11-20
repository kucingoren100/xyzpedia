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

    // Redact secrets: do NOT return raw botToken or smtpPass to the client
    const botToken = settings.telegram.botToken || "";
    const smtpPass = settings.email.smtpPass || "";

    const safeSettings = {
      ...settings,
      telegram: {
        ...settings.telegram,
        botToken: botToken ? `••••••••${botToken.slice(-4)}` : "",
        botTokenSet: !!botToken,
        botTokenLast4: botToken.slice(-4),
      },
      email: {
        ...settings.email,
        smtpPass: smtpPass ? `••••••••${smtpPass.slice(-4)}` : "",
        smtpPassSet: !!smtpPass,
        smtpPassLast4: smtpPass.slice(-4),
      },
    };

    return NextResponse.json({
      success: true,
      settings: safeSettings,
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
