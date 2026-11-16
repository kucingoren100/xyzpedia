import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST() {
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

export async function GET() {
  return POST();
}
