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

export type AuthCookiePayload = {
  userId?: string | number;
  token?: string;
  tokenType?: string;
  refreshToken?: string;
  name?: string;
  role?: unknown;
  username?: string;
};

export async function getAuthCookiePayload(): Promise<AuthCookiePayload | null> {
  const raw = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthCookiePayload;
  } catch {
    return null;
  }
}

function normalizeRole(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const maybeRole = value as { name?: string; description?: string; role?: string };
    return maybeRole.name ?? maybeRole.description ?? maybeRole.role ?? "";
  }
  return String(value);
}

export type SessionUser = {
  id?: string;
  name: string;
  username: string;
  role: string;
};

export function mapAuthPayloadToUser(payload: AuthCookiePayload | null): SessionUser {
  return {
    id: payload?.userId ? String(payload.userId) : undefined,
    name: payload?.name ?? payload?.username ?? "",
    username: payload?.username ?? "",
    role: normalizeRole(payload?.role),
  };
}

export async function getSessionUser(): Promise<SessionUser> {
  const payload = await getAuthCookiePayload();
  return mapAuthPayloadToUser(payload);
}

export async function getAuthTokenFromCookie(): Promise<{
  token: string;
  tokenType: string;
} | null> {
  const payload = await getAuthCookiePayload();
  if (!payload?.token) return null;

  return {
    token: payload.token,
    tokenType: payload.tokenType ?? "Bearer",
  };
}
