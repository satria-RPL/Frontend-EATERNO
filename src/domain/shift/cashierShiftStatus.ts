type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

export type CashierShiftService = {
  fetchCashierShifts: (options?: RequestInit) => Promise<ApiResult>;
};

type CashierShiftApiItem = {
  stationId?: number | string;
  station_id?: number | string;
  status?: string | null;
  closedAt?: string | null;
  closed_at?: string | null;
  isActive?: boolean | number | string;
  is_active?: boolean | number | string;
};

export function createCashierShiftStatusLoader({
  fetchCashierShifts,
}: CashierShiftService) {
  async function loadCashierShifts(options?: RequestInit) {
    return fetchCashierShifts(options);
  }

  async function loadOccupiedStationIds(options?: RequestInit) {
    const result = await fetchCashierShifts(options);
    if (!result.ok) {
      return { ok: false, error: result.error, occupiedIds: [] as string[] };
    }
    return {
      ok: true,
      occupiedIds: resolveOccupiedStationIds(result.data),
    };
  }

  return { loadCashierShifts, loadOccupiedStationIds };
}

export function resolveOccupiedStationIds(payload: unknown): string[] {
  const items = unwrapArray<CashierShiftApiItem>(payload);
  const occupied = new Set<string>();

  items.forEach((item) => {
    if (!isActiveShift(item)) return;
    const stationId = toStringValue(item.stationId ?? item.station_id).trim();
    if (stationId) {
      occupied.add(stationId);
    }
  });

  return Array.from(occupied);
}

function isActiveShift(item: CashierShiftApiItem): boolean {
  const status = normalizeStatus(item.status);
  if (status) {
    return ["open", "active", "opened", "in_progress"].includes(status);
  }

  const activeValue = normalizeBoolean(item.isActive ?? item.is_active);
  if (activeValue != null) return activeValue;

  if ("closedAt" in item || "closed_at" in item) {
    const closedAt = item.closedAt ?? item.closed_at;
    if (closedAt == null) return true;
    if (typeof closedAt === "string") return closedAt.trim() === "";
  }

  return false;
}

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
      if (Array.isArray(nested.items)) return nested.items as T[];
    }
  }

  return [];
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function normalizeStatus(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }
  return null;
}
