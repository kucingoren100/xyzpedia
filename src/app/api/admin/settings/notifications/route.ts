import { NextResponse } from "next/server";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import {
  getNotificationSettings,
  saveNotificationSettings,
} from "@/lib/notifications";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const settings = await getNotificationSettings();

    // Redact secrets: do NOT return raw botToken, smtpPass, or resendApiKey to the client
    const botToken = settings.telegram.botToken || "";
    const smtpPass = settings.email.smtpPass || "";
    const resendApiKey = settings.email.resendApiKey || "";

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
        resendApiKey: resendApiKey ? `••••••••${resendApiKey.slice(-4)}` : "",
        resendApiKeySet: !!resendApiKey,
        resendApiKeyLast4: resendApiKey.slice(-4),
        resendEnvConfigured: !!process.env.RESEND_API_KEY?.trim(),
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
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const body = await req.json();
    const updated = await saveNotificationSettings(body);

    await logAuditEvent({
      actor: session.username || "admin",
      action: "UPDATE_NOTIFICATIONS",
      target: "Notifikasi Telegram & Email",
      summary: `Admin memperbarui konfigurasi gateway notifikasi Telegram & Email.`,
    });

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
