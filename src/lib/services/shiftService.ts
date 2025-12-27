type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

async function fetchApi<T = unknown>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      headers: { Accept: "application/json" },
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

export async function fetchCashierShifts() {
  return fetchApi("/api/cashier-shifts");
}

export async function fetchStations() {
  return fetchApi("/api/stations");
}
