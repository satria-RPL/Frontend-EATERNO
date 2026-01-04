import type { Order } from "@/types/order";

type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

type CashierShiftApiItem = {
  id?: number | string;
  shiftId?: number | string;
  stationId?: number | string;
  cashierId?: number | string;
  openedAt?: string;
  closedAt?: string | null;
  status?: string;
};

export type ShiftStatsSnapshot = {
  checkIn: string;
  workDuration: string;
  openedAtMs: number | null;
};

export type ShiftStatsMetrics = {
  inProcess: number;
  success: number;
  income: number;
};

export type ShiftStatsService = {
  fetchCashierShifts: () => Promise<ApiResult>;
};

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.data,
    record.items,
    record.results,
    record.result,
    record.rows,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
    }
  }

  return [];
}

export function formatDuration(diffMs: number) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatCheckIn(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveOpenShift(items: CashierShiftApiItem[]) {
  const openItems = items.filter((item) => item.status === "open");
  if (openItems.length > 0) {
    return pickLatestByOpenedAt(openItems) ?? openItems[0];
  }
  return pickLatestByOpenedAt(items);
}

function pickLatestByOpenedAt(items: CashierShiftApiItem[]) {
  let selected: CashierShiftApiItem | null = null;
  let bestTimestamp = Number.NEGATIVE_INFINITY;

  items.forEach((item) => {
    const timestamp = toTimestamp(item.openedAt);
    if (timestamp == null) return;
    if (timestamp > bestTimestamp) {
      bestTimestamp = timestamp;
      selected = item;
    }
  });

  return selected;
}

function toTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildShiftStatsSnapshot(
  payload: unknown,
  fallback: ShiftStatsSnapshot
): ShiftStatsSnapshot {
  const items = unwrapArray<CashierShiftApiItem>(payload);
  const openShift = resolveOpenShift(items);
  if (!openShift?.openedAt) return fallback;

  const openedAtMs = Date.parse(openShift.openedAt);
  if (Number.isNaN(openedAtMs)) return fallback;

  return {
    openedAtMs,
    checkIn: formatCheckIn(openShift.openedAt),
    workDuration: formatDuration(Date.now() - openedAtMs),
  };
}