type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

export type TransactionPayload = {
  cashierId?: number | string | null;
  placeId?: number | string | null;
  tableId?: number | string | null;
  orderType?: string | null;
  customerName?: string | null;
  totalItems?: number | null;
  total?: number | null;
  tax?: number | null;
  discount?: number | null;
  paymentMethodId?: number | string | null;
  createdAt?: string;
  items?: {
    qty?: number;
    price?: number | null;
    menuId?: number | string | null;
    variants?: {
      menuVariantId?: number | string | null;
      extraPrice?: number | null;
      qty?: number | null;
    }[];
  }[];
};

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

export async function createTransaction(payload: TransactionPayload) {
  return fetchApi("/api/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchTransactions() {
  return fetchApi("/api/transactions");
}
