import ShiftStats from "@/components/sections/ShiftStats";
import TotalIncome from "@/components/sections/TotalIncome";
import DaySelling from "@/components/sections/DaySelling";
import TotalBalance from "@/components/sections/TotalBalance";
import BestSeller from "@/components/sections/BestSeller";
import { getSessionUser } from "@/lib/session/authSession";
import Motivation from "@/components/sections/Motivation";
import { loadDashboardData } from "@/lib/services/dashboardService";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  const dashboardData = await loadDashboardData();

  return (
    <div className="p-4 space-y-6 min-h-screen ">
      <h1 className="text-3xl font-medium">Manager Dashboard</h1>

      {/* WRAPPER */}
      <div className="flex flex-col gap-y-6">
        {/* ================= ROW 1 ================= */}
        <div className="w-full flex justify-between gap-6">
          <div className="flex-1">
            <ShiftStats
              userName={sessionUser.name}
              snapshot={dashboardData.shiftSnapshot}
              metrics={dashboardData.shiftMetrics}
            />
          </div>

          <div className="flex-1 bg-[#F8F8FA] rounded-xl shadow">
            <Motivation userName={sessionUser.name} />
          </div>
        </div>

        {/* ================= ROW 2 ================= */}
        <div className="w-full flex justify-between gap-6 py-5">
          <div className="flex-1">
            <TotalIncome data={dashboardData.totalIncomeData} />
          </div>

          <div className="flex-1">
            <DaySelling
              data={dashboardData.daySellingData}
              series={dashboardData.daySellingSeries}
            />
          </div>
        </div>

        {/* ================= ROW 3 ================= */}
        <div className="w-full flex justify-between gap-6">
          <div className="flex-1">
            <TotalBalance
              totalIncome={dashboardData.totalBalanceIncome}
              totalExpense={dashboardData.totalExpense}
            />
          </div>

          <div className="flex-1">
            <BestSeller items={dashboardData.bestSellers} />
          </div>
        </div>
      </div>
    </div>
  );
}
