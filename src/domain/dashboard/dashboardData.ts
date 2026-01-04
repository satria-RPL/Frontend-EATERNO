import { buildBestSellersFromTransactions } from "@/domain/bestSeller";
import { normalizeStatus } from "@/domain/transactions/normalizeStatus";
import {
  buildCategoryLookup,
  resolveCategoryMeta,
  resolveItemQty,
  resolveItemTotal,
  resolveTransactionDate,
  resolveTransactionItems,
  unwrapArray,
} from "@/domain/sales/categoryMetrics";
import {
  buildShiftStatsSnapshot,
  type ShiftStatsMetrics,
  type ShiftStatsSnapshot,
} from "@/domain/shift/shiftStats";

type DaySellingSeries = {
  key: string;
  label: string;
  color: string;
};

type DaySellingData = {
  day: string;
} & Record<string, number>;

type TotalIncomeItem = {
  name: string;
  value: number;
};

export type DashboardData = {
  shiftSnapshot: ShiftStatsSnapshot;
  shiftMetrics: ShiftStatsMetrics;
  totalIncomeData: TotalIncomeItem[];
  daySellingData: DaySellingData[];
  daySellingSeries: DaySellingSeries[];
  totalBalanceIncome: number;
  totalExpense: number;
  bestSellers: ReturnType<typeof buildBestSellersFromTransactions>;
};

type DashboardPayloads = {
  transactionsPayload?: unknown;
  menusPayload?: unknown;
  categoriesPayload?: unknown;
  shiftsPayload?: unknown;
  dayCount?: number;
};

const DAY_COUNT = 5;
const SERIES_COLORS = [
  "#F97316",
  "#0EA5E9",
  "#6B7280",
  "#22C55E",
  "#EAB308",
  "#A855F7",
];

function toDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildRecentDays(count: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    return {
      key: toDayKey(date),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });
}

function buildEmptyShiftSnapshot(): ShiftStatsSnapshot {
  return {
    checkIn: "--:--",
    workDuration: "00:00:00",
    openedAtMs: null,
  };
}

function buildEmptyShiftMetrics(): ShiftStatsMetrics {
  return {
    inProcess: 0,
    success: 0,
    income: 0,
  };
}

function sumTransactionItemsTotal(record: Record<string, unknown>) {
  const items = resolveTransactionItems(record);
  return items.reduce((sum, item) => {
    const qty = resolveItemQty(item);
    if (qty <= 0) return sum;
    const total = resolveItemTotal(item, qty);
    if (total <= 0) return sum;
    return sum + total;
  }, 0);
}

export function buildDashboardData({
  transactionsPayload = [],
  menusPayload = [],
  categoriesPayload = [],
  shiftsPayload = [],
  dayCount = DAY_COUNT,
}: DashboardPayloads): DashboardData {
  const transactions = unwrapArray<Record<string, unknown>>(transactionsPayload);
  const lookup = buildCategoryLookup(menusPayload, categoriesPayload);

  const shiftSnapshot = buildShiftStatsSnapshot(
    shiftsPayload,
    buildEmptyShiftSnapshot()
  );
  const shiftMetrics = buildEmptyShiftMetrics();

  const openedAtMs = shiftSnapshot.openedAtMs;
  if (openedAtMs != null) {
    transactions.forEach((transaction) => {
      const createdAt = resolveTransactionDate(transaction);
      if (createdAt == null || createdAt < openedAtMs) return;

      const status = normalizeStatus(transaction.status);
      if (status === "proses") {
        shiftMetrics.inProcess += 1;
        return;
      }
      if (status !== "selesai") return;

      shiftMetrics.success += 1;
      shiftMetrics.income += sumTransactionItemsTotal(transaction);
    });
  }

  const incomeTotals = new Map<string, { label: string; value: number }>();
  const dayTotals = new Map<string, { label: string; total: number }>();
  const days = buildRecentDays(dayCount);
  const dayIndexMap = new Map(days.map((day, index) => [day.key, index]));
  const daySellingData = days.map((day) => ({ day: day.label })) as DaySellingData[];

  transactions.forEach((transaction) => {
    if (normalizeStatus(transaction.status) !== "selesai") return;

    const items = resolveTransactionItems(transaction);
    if (items.length === 0) return;

    const createdAt = resolveTransactionDate(transaction);
    const dayKey = createdAt != null ? toDayKey(new Date(createdAt)) : null;
    const dayIndex = dayKey ? dayIndexMap.get(dayKey) : null;

    items.forEach((item) => {
      const qty = resolveItemQty(item);
      if (qty <= 0) return;
      const total = resolveItemTotal(item, qty);
      if (total <= 0) return;

      const meta = resolveCategoryMeta(item, lookup);
      const existing = incomeTotals.get(meta.key);
      incomeTotals.set(meta.key, {
        label: meta.label,
        value: (existing?.value ?? 0) + total,
      });

      if (dayIndex == null) return;
      const row = daySellingData[dayIndex];
      row[meta.key] = (row[meta.key] ?? 0) + qty;

      const dayExisting = dayTotals.get(meta.key);
      dayTotals.set(meta.key, {
        label: meta.label,
        total: (dayExisting?.total ?? 0) + qty,
      });
    });
  });

  const totalIncomeData = Array.from(incomeTotals.values())
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((entry) => ({ name: entry.label, value: entry.value }));
  const totalBalanceIncome = totalIncomeData.reduce(
    (sum, entry) => sum + entry.value,
    0
  );

  const daySellingSeries = Array.from(dayTotals.entries())
    .map(([key, value]) => ({ key, label: value.label, total: value.total }))
    .filter((entry) => entry.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((entry, index) => ({
      key: entry.key,
      label: entry.label,
      color: SERIES_COLORS[index % SERIES_COLORS.length],
    }));

  if (daySellingSeries.length > 0) {
    daySellingSeries.forEach((entry) => {
      daySellingData.forEach((row) => {
        if (row[entry.key] == null) {
          row[entry.key] = 0;
        }
      });
    });
  }

  return {
    shiftSnapshot,
    shiftMetrics,
    totalIncomeData,
    daySellingData,
    daySellingSeries,
    totalBalanceIncome,
    totalExpense: 0,
    bestSellers: buildBestSellersFromTransactions(transactionsPayload, {
      maxItems: 4,
      fallbackImage: "/img/coffee.jpg",
    }),
  };
}
