"use client";

import ShiftStats from "@/components/sections/ShiftStats";
import TotalIncome from "@/components/sections/TotalIncome";
import DaySelling from "@/components/sections/DaySelling";
import TotalBalance from "@/components/sections/TotalBalance";
import { logout } from "@/app/auth/login/actions";
import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StatsClosingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isPending, startTransition] = useTransition();

  // GET COOKIES DI CLIENT
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.name) setUserName(parsed.name);
      } catch {
        setUserName(token);
      }
    }
  }, []);

  const handleContinue = () => {
    startTransition(async () => {
      await logout(); // ← Logout yang benar
      router.push("/auth/login"); // ← Redirect setelah logout
    });
  };

  return (
    <div className="p-4 space-y-6 min-h-screen">
      <h1 className="text-2xl font-bold">Shift Closing Report</h1>

      {/* WRAPPER */}
      <div className="flex flex-col gap-y-6">
        <div className="w-full flex justify-between gap-6">
          <div className="w-[603px] h-[302px]">
            <ShiftStats userName={userName} />
          </div>

          <div className="w-[428px] h-[292px]">
            <DaySelling />
          </div>
        </div>

        <div className="w-full flex justify-between gap-6 py-5">
          <div className="w-[503px] h-[335px]">
            <TotalIncome />
          </div>

          <div className="w-[503px] h-[335px]">
            <TotalBalance />
          </div>
        </div>
      </div>

      {/* CONTINUE BUTTON */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleContinue}
          disabled={isPending}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg px-10 py-3 rounded-lg transition disabled:bg-gray-400"
        >
          {isPending ? "Loading..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
