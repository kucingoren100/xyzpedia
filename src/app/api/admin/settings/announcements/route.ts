import { NextResponse } from "next/server";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";
import {
  getStoreAnnouncementsConfig,
  saveStoreAnnouncementsConfig,
  StoreAnnouncementsConfig,
} from "@/lib/storeAnnouncements";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const config = await getStoreAnnouncementsConfig();
    return NextResponse.json({ success: true, config });
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
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const body = (await req.json()) as Partial<StoreAnnouncementsConfig>;
    const updated = await saveStoreAnnouncementsConfig(body);

    await logAuditEvent({
      actor: session.username,
      action: "UPDATE_STORE_ANNOUNCEMENTS",
      target: "Store Announcements & Ads",
      summary: `Marquee: ${updated.marquee.isActive ? "Aktif" : "Nonaktif"} | Popup Pengumuman: ${
        updated.popupAnnouncement.isActive ? "Aktif" : "Nonaktif"
      } | Popup Iklan: ${updated.popupAd.isActive ? "Aktif" : "Nonaktif"}`,
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
