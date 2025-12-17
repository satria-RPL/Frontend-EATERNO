import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasValidToken(request: NextRequest) {
  const raw = request.cookies.get("auth_token")?.value ?? null;
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { token?: string } | string;
    if (typeof parsed === "string") return parsed.trim().length > 0;
    return !!parsed.token;
  } catch {
    return raw.trim().length > 0;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const isLogoutRoute = pathname === "/auth/logout";
  const isProtectedRoute = pathname.startsWith("/main");

  const loggedIn = hasValidToken(request);

  if (!loggedIn && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (loggedIn && isAuthRoute && !isLogoutRoute) {
    const dashboardUrl = new URL("/main/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/main/:path*"],
};
