import ShiftStats from "@/components/sections/ShiftStats";
import TotalIncome from "@/components/sections/TotalIncome";
import DaySelling from "@/components/sections/DaySelling";
import TotalBalance from "@/components/sections/TotalBalance";
import BestSeller from "@/components/sections/BestSeller";
import { getSessionUser } from "@/lib/session/authSession";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();

  return (
    <div className="p-4 space-y-6 min-h-screen">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      {/* WRAPPER */}
      <div className="flex flex-col gap-y-6">

        {/* ================= ROW 1 ================= */}
        <div className="w-full flex justify-between gap-6">
          <div className="flex-1">
            <ShiftStats userName={sessionUser.name} />
          </div>

          <div className="flex-1 bg-[#F8F8FA] rounded-xl shadow" />
        </div>

        {/* ================= ROW 2 ================= */}
        <div className="w-full flex justify-between gap-6 py-5">
          <div className="flex-1">
            <TotalIncome />
          </div>

          <div className="flex-1">
            <DaySelling />
          </div>
        </div>

        {/* ================= ROW 3 ================= */}
        <div className="w-full flex justify-between gap-6">
          <div className="flex-1">
            <TotalBalance />
          </div>

          <div className="flex-1">
            <BestSeller />
          </div>
        </div>

      </div>
    </div>
  );
}
