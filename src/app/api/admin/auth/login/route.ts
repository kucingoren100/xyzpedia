import { NextResponse } from "next/server";
import { signAdminToken, verifyAdminCredentials, AUTH_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(username.trim(), password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Username atau password admin salah." },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      username: username.trim(),
      name: "XYZPEDIA Admin",
      role: "SUPERADMIN",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login admin berhasil.",
      admin: {
        username: username.trim(),
        name: "XYZPEDIA Admin",
        role: "SUPERADMIN",
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
