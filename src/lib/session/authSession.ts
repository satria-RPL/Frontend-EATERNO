import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "auth_token";
const SESSION_MAX_AGE = 60 * 60 * 8;

const baseCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: SESSION_MAX_AGE,
  }); 
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
}

export function getSessionToken(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}
