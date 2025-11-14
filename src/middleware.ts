import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionToken } from "@/lib/session/authSession";

export function middleware(request: NextRequest) {
  const token = getSessionToken(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute = pathname.startsWith("/main");

  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    const dashboardUrl = new URL("/main/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/main/:path*"],
};
