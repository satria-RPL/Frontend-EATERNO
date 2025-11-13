"use client";

import { useActionState } from "react";
import { handleLogin, type LoginFormState } from "./actions";
import { LoginFormView } from "./LoginFormView";

const initialState: LoginFormState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction] = useActionState(handleLogin, initialState);

  return <LoginFormView state={state} formAction={formAction} />;
}
