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

  if (!result.success) {
    return { error: result.message };
  }

  await setSessionCookie("dummy-token");
  redirect("/main/dashboard");
}

export async function logout() {
  await clearSessionCookie();

  redirect("/auth/login");
}
