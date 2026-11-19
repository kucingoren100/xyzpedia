import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "xyz_admin_session";

/**
 * Verify admin token with HMAC-SHA256 signature using Web Crypto API (Edge Runtime compatible).
 * This prevents forged tokens where only the exp field is set.
 */
async function verifyAdminTokenEdge(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [encodedPayload, sig] = parts;

    const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET;
    if (!secret) return false;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decode base64url signature
    const base64 = sig.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const sigBytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(encodedPayload)
    );

    if (!isValid) return false;

    // After signature verified, check expiry
    const payloadBase64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payloadPadded = payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
    const payloadJson = atob(payloadPadded);
    const payload = JSON.parse(payloadJson);
    return !!(payload.exp && Date.now() < payload.exp);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /admin paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isLoginPage = pathname === "/admin/login";

  // Verify token with full HMAC-SHA256 signature check (Edge-compatible)
  const isAuthenticated = token ? await verifyAdminTokenEdge(token) : false;

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
