"use server";

import { redirect } from "next/navigation";
import { loginUser } from "@/domain/auth/loginUser";
import { clearSessionCookie, setSessionCookie } from "@/lib/session/authSession";
import { apiRequest } from "@/lib/api";

export type LoginFormState = {
  error?: string;
};

export async function handleLogin(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const username = (formData.get("username") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  const result = await loginUser(username, password);

  if (!result.success || !result.user) {
    return { error: result.message ?? "Login gagal, coba lagi." };
  }

  const user = result.user;
  await setSessionCookie(
    JSON.stringify({
      name: user.name ?? user.username ?? "",
      role: user.role ?? "",
      username: user.username ?? "",
      token: result.token,
      tokenType: result.tokenType,
      refreshToken: result.refreshToken,
    })
  );

  redirect("/public/shift/openshift");
}

export async function logout() {
  await clearSessionCookie();

  redirect("/auth/login");
}
