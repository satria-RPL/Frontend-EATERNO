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

function pickFirst(...values: unknown[]) {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

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

function sumItemTotals(items: Record<string, unknown>[]) {
  return items.reduce((sum, item) => {
    const qty = resolveItemQty(item);
    if (qty <= 0) return sum;
    const total = resolveItemTotal(item, qty);
    if (total <= 0) return sum;
    return sum + total;
  }, 0);
}

function sumTransactionItemsTotal(record: Record<string, unknown>) {
  return sumItemTotals(resolveTransactionItems(record));
}

function resolveTransactionTotal(
  record: Record<string, unknown>,
  fallbackSubtotal?: number
) {
  const total = toNumber(
    pickFirst(
      record.total,
      record.grandTotal,
      record.grand_total,
      record.totalPrice,
      record.total_price,
      record.totalAmount,
      record.total_amount,
      record.totalPayment,
      record.total_payment,
      record.finalTotal,
      record.final_total,
      record.amount,
      record.paidAmount,
      record.paid_amount
    )
  );
  if (total != null && total > 0) return total;

  const subtotal = toNumber(
    pickFirst(record.subtotal, record.subTotal, record.sub_total)
  );
  const tax = toNumber(
    pickFirst(record.tax, record.taxTotal, record.tax_total)
  );
  const discount = toNumber(
    pickFirst(record.discount, record.totalDiscount, record.total_discount)
  );
  if (subtotal != null || tax != null || discount != null) {
    const base = subtotal ?? fallbackSubtotal ?? sumTransactionItemsTotal(record);
    const computed = base + (tax ?? 0) - (discount ?? 0);
    if (computed > 0) return computed;
  }

  return fallbackSubtotal ?? sumTransactionItemsTotal(record);
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
      if (status === "selesai") {
        shiftMetrics.success += 1;
        shiftMetrics.income += resolveTransactionTotal(transaction);
        return;
      }
      if (status === "proses" || status === "ready_to_pickup") {
        shiftMetrics.inProcess += 1;
      }
    });
  }

  const incomeTotals = new Map<string, { label: string; value: number }>();
  const dayTotals = new Map<string, { label: string; total: number }>();
  const days = buildRecentDays(dayCount);
  const dayIndexMap = new Map(days.map((day, index) => [day.key, index]));
  const daySellingData = days.map((day) => ({ day: day.label })) as DaySellingData[];
  let totalBalanceIncome = 0;

  transactions.forEach((transaction) => {
    const status = normalizeStatus(transaction.status);
    if (status !== "selesai") return;

    const items = resolveTransactionItems(transaction);
    const itemsSubtotal = sumItemTotals(items);
    const transactionTotal = resolveTransactionTotal(
      transaction,
      itemsSubtotal
    );
    if (transactionTotal > 0) {
      totalBalanceIncome += transactionTotal;
    }

    if (items.length === 0) return;

    const createdAt = resolveTransactionDate(transaction);
    const dayKey = createdAt != null ? toDayKey(new Date(createdAt)) : null;
    const dayIndex = dayKey ? dayIndexMap.get(dayKey) : null;
    const adjustment = transactionTotal - itemsSubtotal;

    items.forEach((item) => {
      const qty = resolveItemQty(item);
      if (qty <= 0) return;
      const total = resolveItemTotal(item, qty);
      if (total <= 0) return;
      const adjustedTotal =
        itemsSubtotal > 0
          ? total + (total / itemsSubtotal) * adjustment
          : total;
      const finalTotal = Math.max(0, adjustedTotal);

      const meta = resolveCategoryMeta(item, lookup);
      const existing = incomeTotals.get(meta.key);
      incomeTotals.set(meta.key, {
        label: meta.label,
        value: (existing?.value ?? 0) + finalTotal,
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
      fallbackImage: "/img/coffee.webp",
    }),
  };
}
