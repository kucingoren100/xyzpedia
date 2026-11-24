import { NextResponse } from "next/server";
import { getStoreAnnouncementsConfig } from "@/lib/storeAnnouncements";

export const dynamic = "force-dynamic";
export const revalidate = 30; // 30s cache

export async function GET() {
  try {
    const config = await getStoreAnnouncementsConfig();
    return NextResponse.json(
      { success: true, config },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
