import { NextResponse } from "next/server";
import { signAdminToken, verifyAdminCredentials, AUTH_COOKIE_NAME } from "@/lib/adminAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    // Rate limit: max 5 login attempts per 5 minutes per IP
    const rl = checkRateLimit(`admin-login:${clientIp}`, {
      intervalMs: 5 * 60_000,
      max: 5,
    });

    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak percobaan login admin. Silakan tunggu 5 menit demi keamanan.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const authResult = await verifyAdminCredentials(username.trim(), password);

    if (!authResult || !authResult.valid) {
      return NextResponse.json(
        { success: false, message: "Username atau password admin salah." },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      username: username.trim(),
      name: authResult.name || "XYZPEDIA Admin",
      role: authResult.role || "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login admin berhasil.",
      admin: {
        username: username.trim(),
        name: authResult.name || "XYZPEDIA Admin",
        role: authResult.role || "ADMIN",
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
