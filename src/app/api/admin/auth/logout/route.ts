import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, revokeAdminSession } from "@/lib/adminAuth";

export async function POST() {
  await revokeAdminSession();

  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  response.cookies.delete({
    name: AUTH_COOKIE_NAME,
    path: "/",
  });

  return response;
}
