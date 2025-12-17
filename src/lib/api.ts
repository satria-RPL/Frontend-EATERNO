import { getAuthTokenFromCookie } from "@/lib/session/authSession";

type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

type ApiRequestInit = RequestInit & {
  auth?: boolean;
  token?: string;
  tokenType?: string;
};

function getBaseUrl() {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("API_BASE_URL belum diset");
  }
  return baseUrl;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (typeof headers === "object" && "forEach" in headers) {
    const result: Record<string, string> = {};
    (headers as { forEach: (cb: (value: string, key: string) => void) => void }).forEach(
      (value: string, key: string) => {
      result[key] = value;
      }
    );
    return result;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

export async function apiRequest<T = unknown>(
  path: string,
  init: ApiRequestInit = {}
): Promise<ApiResult<T>> {
  const baseUrl = getBaseUrl();

  const { auth, token, tokenType, ...fetchInit } = init;

  let resolvedToken: string | null = null;
  let resolvedTokenType: string | undefined = tokenType;

  if (token) {
    resolvedToken = token;
  } else if (auth) {
    const payload = await getAuthTokenFromCookie();
    resolvedToken = payload?.token ?? null;
    resolvedTokenType = payload?.tokenType ?? resolvedTokenType;
    if (!resolvedToken) {
      return {
        ok: false,
        status: 401,
        error: "Token tidak ditemukan di cookie",
      };
    }
  }

  const authHeader =
    resolvedToken != null
      ? { Authorization: `${resolvedTokenType ?? "Bearer"} ${resolvedToken}` }
      : {};

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...normalizeHeaders(fetchInit.headers),
  };

  if (authHeader.Authorization) {
    headers.Authorization = authHeader.Authorization;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    ...fetchInit,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: (data as Record<string, string>)?.message ?? `Request gagal (${res.status})`,
      data,
    };
  }

  return {
    ok: true,
    status: res.status,
    data: data as T,
  };
}
