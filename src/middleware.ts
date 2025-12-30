import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";

function parseAuthToken(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { token?: unknown } | string;
    if (typeof parsed === "string") {
      const trimmed = parsed.trim();
      return trimmed ? trimmed : null;
    }
    if (parsed && typeof parsed === "object") {
      const token = (parsed as { token?: unknown }).token;
      if (typeof token === "string") {
        const trimmed = token.trim();
        return trimmed ? trimmed : null;
      }
      return null;
    }
    return null;
  } catch {
    const trimmed = raw.trim();
    return trimmed ? trimmed : null;
  }
}

function hasValidToken(request: NextRequest) {
  const raw = request.cookies.get(AUTH_COOKIE)?.value ?? null;
  return parseAuthToken(raw) !== null;
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
