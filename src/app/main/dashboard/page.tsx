import ShiftStats from "@/components/sections/ShiftStats";
import TotalIncome from "@/components/sections/TotalIncome";
import DaySelling from "@/components/sections/DaySelling";
import TotalBalance from "@/components/sections/TotalBalance";
import BestSeller from "@/components/sections/BestSeller";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("auth_token")?.value ?? null;

  let userName = "";

  if (rawSession) {
    try {
      const parsed = JSON.parse(rawSession) as { name?: string };
      if (parsed.name) userName = parsed.name;
    } catch {
      userName = rawSession;
    }
  }

  return (
    <div className="p-4 space-y-6 min-h-screen">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      {/* WRAPPER */}
      <div className="flex flex-col gap-y-6">

        {/* ================= ROW 1 ================= */}
        <div className="w-full flex justify-between gap-6">
          <div className="w-[603px] h-[302px]">
            <ShiftStats userName={userName} />
          </div>

          <div className="w-[428px] h-[292px] bg-[#F8F8FA] rounded-xl shadow" />
        </div>

        {/* ================= ROW 2 ================= */}
        <div className="w-full flex justify-between gap-6 py-5">
          <div className="w-[503px] h-[335px]">
            <TotalIncome />
          </div>

          <div className="w-[503px] h-[335px]">
            <DaySelling />
          </div>
        </div>

        {/* ================= ROW 3 ================= */}
        <div className="w-full flex justify-between gap-6">
          <div className="w-[616px] h-[346px]">
            <TotalBalance />
          </div>

          <div className="w-[411px] h-[346px]">
            <BestSeller />
          </div>
        </div>

      </div>
    </div>
  );
}
