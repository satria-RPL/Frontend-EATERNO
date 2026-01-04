import { buildDashboardData, type DashboardData } from "@/domain/dashboard/dashboardData";
import { apiRequest } from "@/lib/api";

export async function loadDashboardData(
  dayCount?: number
): Promise<DashboardData> {
  const [transactionsResult, menusResult, categoriesResult, shiftsResult] =
    await Promise.all([
      apiRequest("/api/transactions", { auth: true }),
      apiRequest("/api/menus", { auth: true }),
      apiRequest("/api/categories", { auth: true }),
      apiRequest("/api/cashier-shifts", { auth: true }),
    ]);

  return buildDashboardData({
    transactionsPayload: transactionsResult.ok ? transactionsResult.data : [],
    menusPayload: menusResult.ok ? menusResult.data : [],
    categoriesPayload: categoriesResult.ok ? categoriesResult.data : [],
    shiftsPayload: shiftsResult.ok ? shiftsResult.data : [],
    dayCount,
  });
}
