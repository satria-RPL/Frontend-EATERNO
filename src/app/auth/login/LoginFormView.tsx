"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import { useState } from "react";

import type { LoginFormState } from "./actions";

type LoginFormViewProps = {
  state: LoginFormState;
  formAction: (formData: FormData) => void;
};

export function LoginFormView({ state, formAction }: LoginFormViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen">
      <nav className="w-full mb-12">
        <div className="max-w-full mx-auto px-8 py-8">
          <Image
            src="/img/brand.png"
            width={200}
            height={150}
            alt="Brand"
          />
        </div>
      </nav>

      <div className="flex flex-row items-center justify-center px-10 pb-12">
        {/* KIRI: ILUSTRASI */}
        <div className="w-1/2 flex justify-center">
          <div>
            <Image
              src="/img/vector.jpg"
              height={500}
              width={500}
              alt="Vector illustration"
              priority
            />
          </div>
        </div>
        {/* KANAN: FORM LOGIN */}
        <div className="w-1/2 py-10 pr-50">
          <h1 className="text-2xl font-bold text-gray-900 mb-5 text-left">
            Welcome Back!
          </h1>
          <form action={formAction} className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center rounded-md border border-neutral-700 py-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200 transition">
                <Image
                  src="/icon/pin.jpg"
                  height={15}
                  width={15}
                  alt="user"
                  className="mx-3"
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full outline-none text-sm text-gray-700 bg-transparent"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>

              <div className="flex items-center rounded-md border border-neutral-700 py-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200 transition">
                <Image
                  src="/icon/pin.jpg"
                  height={15}
                  width={15}
                  alt="pin"
                  className="mx-3"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  name="password"
                  placeholder="PIN"
                  autoComplete="current-password"
                  className="w-full outline-none text-sm text-gray-700 bg-transparent"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {state?.error && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {state.error}
                </p>
              )}
            </div>

            <div className="mt-1 text-right font-medium">
              <button type="button" className="text-orange-400 outline-none cursor-pointer">
                Forgot PIN?
              </button>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full bg-primary text-white font-semibold py-2.5 rounded-md hover:bg-[#e45713] transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer outline-none"
      disabled={pending}
    >
      {pending ? "Memproses..." : "Login"}
    </button>
  );
}
