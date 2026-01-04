import { apiRequest } from "@/lib/api";

type LoginApiResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
  token_type?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: unknown;
  data?: {
    user?: unknown;
    token?: string;
    accessToken?: string;
    access_token?: string;
    tokenType?: string;
    token_type?: string;
    refreshToken?: string;
    refresh_token?: string;
  };
  profile?: unknown;
};

function toOptionalString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function normalizeRole(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const roleObj = value as Record<string, unknown>;
    return (
      toOptionalString(roleObj["name"]) ??
      toOptionalString(roleObj["description"]) ??
      toOptionalString(roleObj["role"]) ??
      ""
    );
  }
  return "";
}

export async function loginService(username: string, password: string) {
  try {
    const result = await apiRequest<LoginApiResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (!result.ok) {
      return {
        success: false,
        message: result.error || "Login gagal",
      };
    }

    const data = (result.data ?? {}) as LoginApiResponse;
    const user =
      data.user ?? data.data?.user ?? data.data ?? data.profile ?? null;

    const userObj =
      user && typeof user === "object" ? (user as Record<string, unknown>) : null;

    const rawUserId =
      (userObj?.["id"] ??
        userObj?.["userId"] ??
        userObj?.["cashierId"]) ?? null;
    const userId = toOptionalString(rawUserId);

    const rawRole =
      (userObj?.["role"] ??
        userObj?.["roleName"] ??
        userObj?.["position"]) ?? null;

    const role = normalizeRole(rawRole);
    const name =
      toOptionalString(userObj?.["name"]) ??
      toOptionalString(userObj?.["fullName"]) ??
      toOptionalString(userObj?.["username"]) ??
      username;
    const resolvedUsername = toOptionalString(userObj?.["username"]) ?? username;

    const token =
      data.token ??
      data.accessToken ??
      data.access_token ??
      data.data?.token ??
      data.data?.accessToken ??
      data.data?.access_token;

    if (!token) {
      return { success: false, message: "Token login tidak ditemukan" };
    }

    const tokenType =
      data.tokenType ??
      data.token_type ??
      data.data?.tokenType ??
      data.data?.token_type ??
      "Bearer";

    return {
      success: true,
      token,
      tokenType,
      refreshToken:
        data.refreshToken ??
        data.refresh_token ??
        data.data?.refreshToken ??
        data.data?.refresh_token,
      userId,
      user: user
        ? {
            id: userId,
            name,
            username: resolvedUsername,
            role,
          }
        : undefined,
    };
  } catch (err) {
    return { success: false, message: "Koneksi ke server gagal" };
  }
}
