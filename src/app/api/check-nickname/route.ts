import { NextResponse } from "next/server";
import { fetchGameNickname } from "@/lib/gameNickname";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const zoneId = searchParams.get("zoneId")?.trim() || null;
    const game = searchParams.get("game")?.trim() || "";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID diperlukan" },
        { status: 400 }
      );
    }

    const name = await fetchGameNickname(userId, zoneId, game);

    if (name) {
      return NextResponse.json({
        success: true,
        name,
        userId,
        zoneId,
      });
    }

    return NextResponse.json(
      { success: false, error: "Akun tidak ditemukan atau server game sedang sibuk." },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memeriksa nickname" },
      { status: 500 }
    );
  }
}
