import { loginService } from "@/lib/services/authService";

export type LoginResult = {
  success: boolean;
  message?: string;
  token?: string;
  tokenType?: string;
  refreshToken?: string;
  user?: {
    name?: string;
    username?: string;
    role?: string;
  };
};

export async function loginUser(
  rawUsername: string,
  rawPassword: string
): Promise<LoginResult> {
  const username = rawUsername?.trim();
  const password = rawPassword?.trim();

  if (!username) {
    return { success: false, message: "Username wajib diisi." };
  }

  if (!password) {
    return { success: false, message: "PIN wajib diisi." };
  }

  const result = await loginService(username, password);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return {
    success: true,
    token: result.token,
    tokenType: result.tokenType,
    refreshToken: result.refreshToken,
    user: result.user,
  };
}
