type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

export type ShiftService = {
  fetchShifts: () => Promise<ApiResult>;
  fetchStations: () => Promise<ApiResult>;
};

type ShiftApiItem = {
  id?: string | number;
  shiftId?: string | number;
  shift_id?: string | number;
  placeId?: string | number;
  place_id?: string | number;
  name?: string;
  label?: string;
  title?: string;
  description?: string;
  shiftName?: string;
  shift_name?: string;
  code?: string;
  startTime?: string;
  start_time?: string;
  start?: string;
  endTime?: string;
  end_time?: string;
  end?: string;
  isActive?: boolean | number | string;
  is_active?: boolean | number | string;
};

type StationApiItem = {
  id?: string | number;
  placeId?: string | number;
  place_id?: string | number;
  name?: string;
  label?: string;
  title?: string;
  description?: string;
  isActive?: boolean | number | string;
  is_active?: boolean | number | string;
};

export type ShiftOption = {
  value: string;
  label: string;
  placeId?: string;
};

export type StationOption = {
  value: string;
  label: string;
  placeId?: string;
};

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
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
    record.shift,
    record.shifts,
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

function buildShiftLabel(item: ShiftApiItem, fallbackId: string): string {
  const base =
    item.description ??
    item.name ??
    item.label ??
    item.title ??
    item.shiftName ??
    item.shift_name ??
    item.code;
  const baseLabel = toStringValue(base).trim();

  const start = item.startTime ?? item.start_time ?? item.start;
  const end = item.endTime ?? item.end_time ?? item.end;
  const startLabel = toStringValue(start).trim();
  const endLabel = toStringValue(end).trim();
  const timeLabel =
    startLabel || endLabel ? `${startLabel || "?"}-${endLabel || "?"}` : "";

  if (baseLabel && timeLabel) {
    return `${baseLabel} (${timeLabel})`;
  }
  if (baseLabel) {
    return baseLabel;
  }
  if (timeLabel) {
    return `Shift ${timeLabel}`;
  }

  if (fallbackId) return `Shift ${fallbackId}`;
  return "Shift";
}

function buildStationLabel(item: StationApiItem, fallbackId: string): string {
  const name = toStringValue(item.name ?? item.label ?? item.title).trim();
  const description = toStringValue(item.description).trim();

  if (name) return name;
  if (description) return description;
  if (fallbackId) return `Station ${fallbackId}`;
  return "Station";
}

export function createShiftOptionsLoader({
  fetchShifts,
  fetchStations,
}: ShiftService) {
  async function loadShiftOptions(): Promise<{
    options: ShiftOption[];
    error: string | null;
  }> {
    const result = await fetchShifts();
    if (!result.ok) {
      return {
        options: [],
        error: result.error || "Gagal mengambil data shift",
      };
    }

    const items = unwrapArray<ShiftApiItem>(result.data);
    const options = items.reduce<ShiftOption[]>((acc, item) => {
      const activeValue = normalizeBoolean(item.isActive ?? item.is_active);
      if (activeValue === false) return acc;

      const value = toStringValue(
        item.id ??
          item.shiftId ??
          item.shift_id ??
          item.code ??
          item.name ??
          item.label ??
          item.title
      ).trim();

      if (!value) return acc;
      const placeId = toStringValue(item.placeId ?? item.place_id).trim();

      acc.push({
        value,
        label: buildShiftLabel(item, value),
        placeId: placeId || undefined,
      });
      return acc;
    }, []);

    return { options, error: null };
  }

  async function loadStationOptions(): Promise<{
    options: StationOption[];
    error: string | null;
  }> {
    const result = await fetchStations();
    if (!result.ok) {
      return {
        options: [],
        error: result.error || "Gagal mengambil data station",
      };
    }

    const items = unwrapArray<StationApiItem>(result.data);
    const options = items.reduce<StationOption[]>((acc, item) => {
      const activeValue = normalizeBoolean(item.isActive ?? item.is_active);
      if (activeValue === false) return acc;

      const value = toStringValue(item.id ?? item.name ?? item.label).trim();
      if (!value) return acc;

      const placeId = toStringValue(item.placeId ?? item.place_id).trim();

      acc.push({
        value,
        label: buildStationLabel(item, value),
        placeId: placeId || undefined,
      });
      return acc;
    }, []);

    return { options, error: null };
  }

  return { loadShiftOptions, loadStationOptions };
}
