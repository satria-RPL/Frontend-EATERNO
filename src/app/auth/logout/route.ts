import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";
import { clearSessionCookie, getAuthCookiePayload } from "@/lib/session/authSession";

export async function POST() {
  await closeOpenShiftIfNeeded();
  await clearSessionCookie();

  return NextResponse.json({ success: true });
}

type CashierShiftApiItem = {
  id?: number | string;
  cashierId?: number | string;
  status?: string | null;
  openedAt?: string | null;
  opened_at?: string | null;
  closedAt?: string | null;
  closed_at?: string | null;
};

async function closeOpenShiftIfNeeded() {
  try {
    const authPayload = await getAuthCookiePayload();
    const cashierId = toNumber(authPayload?.userId);
    if (!cashierId) return;
    const role = normalizeRole(authPayload?.role);
    if (role.includes("waiter")) return;

    const shiftsResult = await apiRequest("/api/cashier-shifts", { auth: true });
    if (!shiftsResult.ok) return;

    const items = unwrapArray<CashierShiftApiItem>(shiftsResult.data);
    const openShift = pickLatestOpenShift(items, cashierId);
    if (!openShift?.id) return;

    await apiRequest(`/api/cashier-shifts/${openShift.id}`, {
      auth: true,
      method: "POST",
      body: JSON.stringify({
        status: "closed",
        closedAt: new Date().toISOString(),
      }),
    });
  } catch {
    // Best-effort close: do not block logout if the API fails.
  }
}

function normalizeRole(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.toLowerCase();
  if (typeof value === "object") {
    const record = value as {
      name?: unknown;
      description?: unknown;
      role?: unknown;
    };
    const resolved =
      record.name ?? record.description ?? record.role ?? "";
    return typeof resolved === "string" ? resolved.toLowerCase() : "";
  }
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

function pickLatestOpenShift(items: CashierShiftApiItem[], cashierId: number) {
  const openItems = items.filter(
    (item) => toNumber(item.cashierId) === cashierId && isOpenShift(item)
  );
  if (openItems.length === 0) return null;

  let selected: CashierShiftApiItem | null = null;
  let bestTimestamp = Number.NEGATIVE_INFINITY;

  openItems.forEach((item) => {
    const timestamp = toTimestamp(item.openedAt ?? item.opened_at);
    if (timestamp != null && timestamp > bestTimestamp) {
      bestTimestamp = timestamp;
      selected = item;
    }
  });

  return selected ?? openItems[0] ?? null;
}

function isOpenShift(item: CashierShiftApiItem) {
  const status = normalizeStatus(item.status);
  if (status) {
    return ["open", "active", "opened", "in_progress"].includes(status);
  }

  const closedAt = item.closedAt ?? item.closed_at;
  if (closedAt == null) return true;
  if (typeof closedAt === "string") return closedAt.trim() === "";
  return false;
}

function normalizeStatus(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function toTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
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
