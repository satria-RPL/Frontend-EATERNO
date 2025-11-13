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
      <nav className="w-full bg-white mb-12 border-b">
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

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 px-4 pb-12">
        {/* KANAN: FORM LOGIN */}
        <div className="w-full lg:w-1/2 px-6 sm:px-10 py-10 bg-white rounded-2xl shadow-sm border border-orange-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-5 text-center lg:text-left">
            Welcome Back!
          </h1>
          <form action={formAction} className="space-y-5">
            <div>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200 transition">
                <Image
                  src="/icon/pin.jpg"
                  height={15}
                  width={15}
                  alt="pin"
                  className="mr-3"
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
              <button
                type="button"
                disabled
                className="text-orange-300 cursor-not-allowed"
                aria-disabled="true"
              >
                Forgot PIN?
              </button>
            </div>

            <SubmitButton />
          </form>
        </div>

        {/* KIRI: ILUSTRASI */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="max-w-md">
            <Image
              src="/img/vector.jpg"
              height={500}
              width={500}
              alt="Vector illustration"
              className="w-full h-auto object-contain"
              priority
            />
          </div>
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
      className="w-full bg-[#f26522] text-white font-semibold py-2.5 rounded-lg hover:bg-[#e45713] transition disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Memproses..." : "Login"}
    </button>
  );
}
