export type LoginResult = {
  success: boolean;
  message?: string;
  token?: string;
  tokenType?: string;
  refreshToken?: string;
  userId?: number | string;
  user?: {
    id?: number | string;
    name?: string;
    username?: string;
    role?: string;
  };
};

export type LoginService = (
  username: string,
  password: string
) => Promise<LoginResult>;

export function createLoginUser(loginService: LoginService) {
  return async function loginUser(
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
      userId: result.userId,
      user: result.user,
    };
  };
}
