import { NextResponse } from "next/server";
import { checkGameAccount } from "@/lib/gameNickname";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`check-nickname:${clientIp}`, {
      intervalMs: 60_000,
      max: 30, // max 30 requests per minute per IP
    });

    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          isFound: false,
          error: "Terlalu banyak permintaan cek ID. Silakan tunggu 1 menit.",
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const zoneId = searchParams.get("zoneId")?.trim() || null;
    const game = searchParams.get("game")?.trim() || "";

    if (!userId) {
      return NextResponse.json(
        { success: false, isFound: false, error: "User ID diperlukan" },
        { status: 400 }
      );
    }

    const check = await checkGameAccount(userId, zoneId, game);

    return NextResponse.json({
      success: check.success,
      isFound: check.isFound,
      name: check.name || null,
      message: check.message,
      userId,
      zoneId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        isFound: false,
        error: error.message || "Gagal memeriksa akun",
      },
      { status: 500 }
    );
  }
}
