"use server";

import { redirect } from "next/navigation";
import { createLoginUser } from "@/domain/auth/loginUser";
import { clearSessionCookie, setSessionCookie } from "@/lib/session/authSession";
import { loginService } from "@/lib/services/authService";

const loginUser = createLoginUser(loginService);

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

  if (!result.success || !result.user || !result.token) {
    return { error: result.message ?? "Login gagal, token tidak valid." };
  }

  const user = result.user;
  await setSessionCookie(
    JSON.stringify({
      userId: result.userId ?? user?.id ?? null,
      name: user.name ?? user.username ?? "",
      role: user.role ?? "",
      username: user.username ?? "",
      token: result.token,
      tokenType: result.tokenType,
      refreshToken: result.refreshToken,
    })
  );

  const role = String(user?.role ?? "").toLowerCase();
  if (role.includes("chef")) {
    redirect("/main/kitchen");
  }
  redirect("/public/shift/openshift");
}

export async function logout() {
  await clearSessionCookie();

  redirect("/auth/login");
}
