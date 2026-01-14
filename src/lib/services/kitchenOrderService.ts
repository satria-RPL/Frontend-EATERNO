"use client";

type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

async function clientRequest<T = unknown>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          (data as Record<string, string>)?.message ??
          `Request gagal (${res.status})`,
        data,
      };
    }

    return { ok: true, status: res.status, data: data as T };
  } catch {
    return { ok: false, status: 500, error: "Koneksi ke server gagal" };
  }
}

export function fetchKitchenOrders() {
  return clientRequest("/api/transactions");
}

export function fetchKitchenOrderStatuses() {
  return clientRequest("/api/kitchen-orders");
}

export async function updateKitchenOrderStatus(
  kitchenOrderId: number,
  status: "queued" | "proses" | "done"
) {
  try {
    const res = await fetch(`/api/kitchen-orders/${kitchenOrderId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false as const,
        status: res.status,
        error:
          (data as Record<string, string>)?.message ??
          `Request gagal (${res.status})`,
        data,
      };
    }

    return { ok: true as const, status: res.status, data };
  } catch {
    return { ok: false as const, status: 500, error: "Koneksi ke server gagal" };
  }
}

export async function createKitchenOrderStatus(
  payload: {
    transactionItemId: number;
    status: "queued" | "proses" | "done";
    note?: string | null;
  }
) {
  try {
    const res = await fetch("/api/kitchen-orders", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false as const,
        status: res.status,
        error:
          (data as Record<string, string>)?.message ??
          `Request gagal (${res.status})`,
        data,
      };
    }

    return { ok: true as const, status: res.status, data };
  } catch {
    return { ok: false as const, status: 500, error: "Koneksi ke server gagal" };
  }
}
