import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";

function parseAuthToken(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { token?: unknown } | string;
    if (typeof parsed === "string") return parsed.trim() || null;
    if (parsed && typeof parsed === "object") {
      const token = (parsed as { token?: unknown }).token;
      return typeof token === "string" && token.trim() ? token : null;
    }
    return null;
  } catch {
    return null;
  }
}

function parseRole(raw: string | null): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as { role?: unknown };
    const role = parsed?.role;
    if (typeof role === "string") return role.toLowerCase();
    if (role && typeof role === "object") {
      type RoleObj = { name?: string; description?: string; role?: string };
      const r = role as RoleObj;
      return (
        r.name ??
        r.description ??
        r.role ??
        ""
      ).toLowerCase();
    }
    return "";
  } catch {
    return "";
  }
}

function hasValidToken(request: NextRequest) {
  const raw = request.cookies.get(AUTH_COOKIE)?.value ?? null;
  return parseAuthToken(raw) !== null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ PENTING: JANGAN SENTUH LOGOUT
  if (pathname === "/auth/logout") {
    return NextResponse.next();
  }

  const isAuthRoute = pathname.startsWith("/auth");
  const isMainRoute = pathname.startsWith("/main");
  const isWaiterRoute = pathname.startsWith("/waiters");

  const loggedIn = hasValidToken(request);
  const role = parseRole(request.cookies.get(AUTH_COOKIE)?.value ?? null);
  const isChef = role.includes("chef");
  const isOwner = role.includes("owner");
  const isWaiter = role.includes("waiter");
  const isKitchenRole = isChef || isOwner;

  if (!loggedIn && (isMainRoute || isWaiterRoute)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (loggedIn && isAuthRoute) {
    return NextResponse.redirect(
      new URL(
        isWaiter
          ? "/waiters"
          : isChef
          ? "/main/kitchen"
          : "/main/dashboard",
        request.url
      )
    );
  }

  if (loggedIn && isWaiter && isMainRoute) {
    return NextResponse.redirect(new URL("/waiters", request.url));
  }

  if (
    loggedIn &&
    isMainRoute &&
    pathname.startsWith("/main/kitchen") &&
    !isKitchenRole
  ) {
    return NextResponse.redirect(new URL("/main/dashboard", request.url));
  }

  if (loggedIn && !isWaiter && isWaiterRoute) {
    return NextResponse.redirect(
      new URL(isChef ? "/main/kitchen" : "/main/dashboard", request.url)
    );
  }

  if (loggedIn && isChef && isMainRoute && !pathname.startsWith("/main/kitchen")) {
    return NextResponse.redirect(new URL("/main/kitchen", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/main/:path*", "/public/shift/:path*", "/waiters/:path*"]
};

