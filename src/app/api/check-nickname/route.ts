import { NextResponse } from "next/server";
import { checkGameAccount } from "@/lib/gameNickname";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
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
