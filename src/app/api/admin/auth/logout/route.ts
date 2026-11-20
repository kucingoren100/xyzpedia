import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, revokeAdminSession, getAdminSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export async function POST() {
  const session = await getAdminSession().catch(() => null);
  if (session) {
    await logAuditEvent({
      actor: session.username || "admin",
      action: "LOGOUT",
      target: "Admin Dashboard",
      summary: `Admin "${session.username}" logout dari dashboard.`,
    });
  }

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
