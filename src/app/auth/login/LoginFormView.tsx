"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import type { LoginFormState } from "./actions";

type LoginFormViewProps = {
  state: LoginFormState;
  formAction: (formData: FormData) => void;
};

export function LoginFormView({ state, formAction }: LoginFormViewProps) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="w-full bg-white mb-12">
        <div className="max-w-full mx-auto px-6 py-3">
          <Image
            src="/icon/brand.svg"
            width={80}
            height={80}
            alt="Brand"
            className="h-fit w-fit object-cover"
          />
        </div>
      </nav>

      <div className="flex flex-row items-center justify-center gap-10 px-4 pb-12">
        {/* KIRI: ILUSTRASI */}
        <div className="w-1/2 flex justify-center">
          <div className="">
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
        <div className="w-1/2 py-10 bg-white rounded-2xl shadow-sm border border-orange-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-5 text-left">
            Welcome Back!
          </h1>
          <form action={formAction} className="space-y-5">
            <div>
              <div className="flex items-center rounded-md border border-gray-300 py-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200 transition">
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
                  name="pin"
                  placeholder="PIN"
                  className="w-full outline-none text-sm text-gray-700 bg-transparent"
                  required
                />
              </div>
              {state?.error && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {state.error}
                </p>
              )}
            </div>

            <div className="mt-1 text-right text-xs">
              <button type="button" className="text-orange-300">
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
      className="w-full bg-[#f26522] text-white font-semibold py-2.5 rounded-md hover:bg-[#e45713] transition disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Memproses..." : "Login"}
    </button>
  );
}
