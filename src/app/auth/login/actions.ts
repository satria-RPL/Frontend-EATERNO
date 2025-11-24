"use server";

import { redirect } from "next/navigation";
import { loginUser } from "@/domain/auth/loginUser";
import { clearSessionCookie, setSessionCookie } from "@/lib/session/authSession";

export type LoginFormState = {
  error?: string;
};

export async function handleLogin(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const pin = (formData.get("pin") as string) ?? "";

  const result = await loginUser(pin);

  if (!result.success || !result.user) {
    return { error: result.message ?? "Login gagal, coba lagi." };
  }

  const user = result.user;
  await setSessionCookie(JSON.stringify({ name: user.name, role: user.role }));

  redirect("/public/shift/openshift");
}

export async function logout() {
  await clearSessionCookie();

  redirect("/auth/login");
}
