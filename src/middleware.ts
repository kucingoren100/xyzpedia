import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "xyz_admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isLoginPage = pathname === "/admin/login";

  let isAuthenticated = false;

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 2) {
        const payloadJson = Buffer.from(parts[0], "base64url").toString("utf8");
        const payload = JSON.parse(payloadJson);
        if (payload.exp && Date.now() < payload.exp) {
          isAuthenticated = true;
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // If trying to access protected admin page without auth -> redirect to login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visits /admin/login -> redirect to /admin
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
