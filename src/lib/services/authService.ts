import { apiRequest } from "@/lib/api";

type LoginApiResponse = {
  token?: string;
  tokenType?: string;
  token_type?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: unknown;
  data?: {
    user?: unknown;
    token?: string;
    tokenType?: string;
    token_type?: string;
    refreshToken?: string;
    refresh_token?: string;
  };
  profile?: unknown;
};

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

    const rawRole =
      (userObj?.["role"] ??
        userObj?.["roleName"] ??
        userObj?.["position"]) ?? null;

    const role =
      typeof rawRole === "string"
        ? rawRole
        : (rawRole as Record<string, unknown> | null)?.["name"] ??
          (rawRole as Record<string, unknown> | null)?.["description"] ??
          "";

    return {
      success: true,
      token: data.token ?? data.data?.token,
      tokenType:
        data.tokenType ??
        data.token_type ??
        data.data?.tokenType ??
        data.data?.token_type ??
        "Bearer",
      refreshToken:
        data.refreshToken ??
        data.refresh_token ??
        data.data?.refreshToken ??
        data.data?.refresh_token,
      user: user
        ? {
            name:
              userObj?.["name"] ??
              userObj?.["fullName"] ??
              userObj?.["username"] ??
              username,
            username: userObj?.["username"] ?? username,
            role,
          }
        : undefined,
    };
  } catch (err) {
    return { success: false, message: "Koneksi ke server gagal" };
  }
}
