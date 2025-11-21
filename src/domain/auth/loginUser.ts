import { loginService } from "@/lib/services/authService";

export type LoginResult = {
  success: boolean;
  message?: string;
  user?: {
    name: string;
    pin: string;
    role?: string;
  };
};

export async function loginUser(rawPin: string): Promise<LoginResult> {
  const pin = rawPin?.trim();

  if (!pin) {
    return { success: false, message: "PIN wajib diisi." };
  }

  const result = await loginService(pin);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  return {
    success: true,
    user: result.user,
  };
}
