type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

async function fetchApi<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(path, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message?: unknown }).message)
          : `Request gagal (${res.status})`;
      return { ok: false, status: res.status, error: message, data };
    }

    return { ok: true, status: res.status, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "Koneksi ke server gagal" };
  }
}

export async function fetchCashierShifts(options: RequestInit = {}) {
  return fetchApi("/api/cashier-shifts", options);
}

export async function fetchShifts() {
  return fetchApi("/api/shifts");
}

export async function fetchStations(options: RequestInit = {}) {
  return fetchApi("/api/stations", options);
}

export async function createCashierShift(payload: {
  shiftId: number;
  stationId: number;
  placeId: number;
  openingBalance: number;
}) {
  return fetchApi("/api/cashier-shifts/open", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
