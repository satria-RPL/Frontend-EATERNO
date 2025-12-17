"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function StatsClosingClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    startTransition(async () => {
      await fetch("/auth/logout", { method: "POST" });
      router.push("/auth/login");
    });
  };

  return (
    <div className="flex justify-center pt-4">
      <button
        onClick={handleContinue}
        disabled={isPending}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg px-10 py-3 rounded-lg transition disabled:bg-gray-400"
      >
        {isPending ? "Loading..." : "Continue"}
      </button>
    </div>
  );
}
