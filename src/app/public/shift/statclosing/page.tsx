import { cookies } from "next/headers";
import ShiftStats from "@/components/sections/ShiftStats";
import TotalIncome from "@/components/sections/TotalIncome";
import DaySelling from "@/components/sections/DaySelling";
import TotalBalance from "@/components/sections/TotalBalance";
import StatsClosingClient from "./stats-closing-client";
import { loadDashboardData } from "@/lib/services/dashboardService";

export default async function StatsClosingPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("auth_token")?.value ?? null;
  const dashboardData = await loadDashboardData();

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
      <h1 className="text-2xl font-bold">Shift Closing Report</h1>

      {/* WRAPPER */}
      <div className="flex flex-col gap-y-6">
        <div className="w-full flex justify-between gap-6">
          <div className="flex-1">
            <ShiftStats
              userName={userName}
              snapshot={dashboardData.shiftSnapshot}
              metrics={dashboardData.shiftMetrics}
            />
          </div>

          <div className="flex-1">
            <DaySelling
              data={dashboardData.daySellingData}
              series={dashboardData.daySellingSeries}
            />
          </div>
        </div>

        <div className="w-full flex justify-between gap-6 py-5">
          <div className="flex-1">
            <TotalIncome data={dashboardData.totalIncomeData} />
          </div>

          <div className="flex-1">
            <TotalBalance
              totalIncome={dashboardData.totalBalanceIncome}
              totalExpense={dashboardData.totalExpense}
            />
          </div>
        </div>
      </div>

      <StatsClosingClient />
    </div>
  );
}
