import { normalizeStatus } from "@/domain/transactions/normalizeStatus";
import { Order } from "@/types/order";

type TransactionItem = {
  qty?: number;
  price?: number | null;
  menuId?: number | null;
  transactionId?: number | null;
  transaction_id?: number | null;
  note?: string | null;
  menu?: {
    id?: number | null;
    name?: string | null;
  } | null;
  variants?: {
    id?: number | null;
    transactionItemId?: number | null;
    menuVariantId?: number | null;
    extraPrice?: number | null;
    menuVariant?: {
      id?: number | null;
      name?: string | null;
    } | null;
  }[];
};

type Transaction = {
  id?: number;
  transactionId?: number | string | null;
  transaction_id?: number | string | null;
  code?: string | number | null;
  orderNumber?: string | number | null;
  order_no?: string | number | null;
  invoiceNumber?: string | number | null;
  invoice_no?: string | number | null;
  receiptNumber?: string | number | null;
  receipt_no?: string | number | null;
  customerName?: string | null;
  orderType?: string | null;
  tableId?: number | null;
  status?: string | null;
  note?: string | null;
  items?: TransactionItem[];
  itemsJson?: TransactionItem[];
  total?: number | null;
  tax?: number | null;
  discount?: number | null;
  paymentMethodId?: number | string | null;
  createdAt?: string | null;
};

type TransactionResponse = Transaction[] | { data?: Transaction[] };

type TransactionItemsResponse = TransactionItem[] | { data?: TransactionItem[] };

function mapTransactionToOrder(tx: Transaction, items: TransactionItem[]) {
  const relatedItems =
    tx.items && tx.items.length > 0
      ? tx.items
      : tx.itemsJson && tx.itemsJson.length > 0
      ? tx.itemsJson
      : items;
  const detailItems = mapDetailItems(relatedItems);

  return {
    id: resolveTransactionCode(tx),
    transactionId: resolveTransactionIdValue(tx),
    note: tx.note ?? null,
    name: normalizeName(tx),
    payment: normalizePayment(tx.paymentMethodId ?? null),
    price: tx.total ?? 0,
    items: sumItems(relatedItems),
    date: tx.createdAt ?? new Date().toISOString(),
    status: normalizeStatus(tx.status ?? null),
    tax: tx.tax ?? 0,
    discount: tx.discount ?? 0,
    customerName: tx.customerName ?? null,
    orderType: tx.orderType ?? null,
    tableId: tx.tableId ?? null,
    createdAt: tx.createdAt ?? null,
    detailItems,
  };
}

function resolveTransactionIdValue(tx: Transaction): number | null {
  const candidate = tx.id ?? tx.transactionId ?? tx.transaction_id ?? null;
  if (typeof candidate === "number") {
    return Number.isFinite(candidate) ? candidate : null;
  }
  if (typeof candidate === "string") {
    return parseNumericIdFromString(candidate);
  }
  return null;
}

function normalizePayment(value: Transaction["paymentMethodId"]): string {
  if (typeof value === "string") return value;
  if (value === 1) return "Cash";
  if (value === 2) return "QRIS";
  if (value === 3) return "Bank";
  return "Unknown";
}

function normalizeName(tx: Transaction): string {
  if (tx.customerName) return tx.customerName;
  if (tx.orderType === "dine_in" && tx.tableId) {
    return `Table ${tx.tableId}`;
  }
  if (tx.orderType) {
    const normalized = tx.orderType.replace(/_/g, " ");
    return normalized.replace(/\b\w/g, (match) => match.toUpperCase());
  }
  return "-";
}

function resolveTransactionCode(tx: Transaction): string {
  const raw =
    tx.code ??
    tx.orderNumber ??
    tx.order_no ??
    tx.invoiceNumber ??
    tx.invoice_no ??
    tx.receiptNumber ??
    tx.receipt_no ??
    tx.id;
  if (raw == null) return "-";
  const value = String(raw);
  return value.startsWith("#") ? value : `#${value}`;
}

function resolveTransactionKey(tx: Transaction): string | null {
  const raw =
    tx.id ??
    tx.code ??
    tx.orderNumber ??
    tx.order_no ??
    tx.invoiceNumber ??
    tx.invoice_no ??
    tx.receiptNumber ??
    tx.receipt_no ??
    null;
  if (raw == null) return null;
  const value = String(raw).trim();
  return value ? value : null;
}

function resolveDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function buildQueueNumberMap(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => {
    const aTime = Date.parse(a.createdAt ?? "");
    const bTime = Date.parse(b.createdAt ?? "");
    const aTs = Number.isNaN(aTime) ? 0 : aTime;
    const bTs = Number.isNaN(bTime) ? 0 : bTime;
    if (aTs !== bTs) return aTs - bTs;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  const counters = new Map<string, number>();
  const map = new Map<string, number>();

  sorted.forEach((tx) => {
    const key = resolveTransactionKey(tx);
    const dateKey = resolveDateKey(tx.createdAt ?? null);
    if (!key || !dateKey) return;
    const next = (counters.get(dateKey) ?? 0) + 1;
    counters.set(dateKey, next);
    map.set(key, next);
  });

  return map;
}

function sumItems(items?: TransactionItem[]): number {
  return (items ?? []).reduce((total, item) => total + (item.qty ?? 0), 0);
}

function resolveTransactionId(item: TransactionItem): number | null {
  const value = item.transactionId ?? item.transaction_id ?? null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function mapDetailItems(items: TransactionItem[]) {
  return items.map((item) => {
    const name = item.menu?.name ?? "Menu";
    const qty = item.qty ?? 0;
    const price = item.price ?? 0;
    const note =
      typeof item.note === "string" && item.note.trim()
        ? item.note.trim()
        : undefined;
    const options =
      item.variants?.map((variant) => ({
        label: variant.menuVariant?.name ?? "Varian",
        price: variant.extraPrice ?? 0,
      })) ?? [];
    return {
      name,
      qty,
      price,
      note,
      options: options.length > 0 ? options : undefined,
    };
  });
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const [transactionsRes, itemsRes] = await Promise.all([
      fetch("/api/transactions", { cache: "no-store" }),
      fetch("/api/transaction-items", { cache: "no-store" }).catch(() => null),
    ]);

    const data = (await transactionsRes.json().catch(() => null)) as
      | TransactionResponse
      | null;
    const itemsPayload = itemsRes
      ? ((await itemsRes.json().catch(() => null)) as
          | TransactionItemsResponse
          | null)
      : null;

    if (!transactionsRes.ok || !data) {
      return [];
    }

    const transactions = Array.isArray(data) ? data : data.data ?? [];
    const queueMap = buildQueueNumberMap(transactions);
    const transactionItems = Array.isArray(itemsPayload)
      ? itemsPayload
      : itemsPayload?.data ?? [];

    const itemsByTransactionId = new Map<number, TransactionItem[]>();
    for (const item of transactionItems) {
      const transactionId = resolveTransactionId(item);
      if (!transactionId) continue;
      const existing = itemsByTransactionId.get(transactionId) ?? [];
      existing.push(item);
      itemsByTransactionId.set(transactionId, existing);
    }

    return transactions.map((tx) => {
      const relatedItems =
        tx.items && tx.items.length > 0
          ? tx.items
          : tx.itemsJson && tx.itemsJson.length > 0
          ? tx.itemsJson
          : itemsByTransactionId.get(tx.id ?? -1) ?? [];

      const order = mapTransactionToOrder(tx, relatedItems);
      const key = resolveTransactionKey(tx);
      return {
        ...order,
        queueNumber: key ? queueMap.get(key) ?? null : null,
      };
    });
  } catch {
    return [];
  }
}

function parseNumericIdFromString(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!normalized) return null;
  if (/^\d+$/.test(normalized)) {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const match = normalized.match(/(\d+)(?!.*\d)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTransactionId(value: string | number): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  return parseNumericIdFromString(String(value));
}

export async function voidOrder(
  orderId: string | number,
  payload: { password: string; voidReason?: string; reason?: string }
) {
  const resolvedId = parseTransactionId(orderId);

  if (!resolvedId || resolvedId <= 0) {
    throw new Error("ID transaksi tidak valid");
  }

  const rawReason =
    typeof payload.voidReason === "string"
      ? payload.voidReason
      : payload.reason;
  const trimmedReason = typeof rawReason === "string" ? rawReason.trim() : "";
  const bodyPayload = {
    password: payload.password,
    ...(trimmedReason
      ? { voidReason: trimmedReason, reason: trimmedReason }
      : {}),
  };

  const encodedId = encodeURIComponent(String(resolvedId));
  const res = await fetch(`/api/transactions/void/${encodedId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(bodyPayload),
    credentials: "include",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message?: unknown }).message)
        : `Void gagal (${res.status})`;
    throw new Error(message);
  }
}

export async function updateTransactionStatus(
  transactionId: number,
  status: string
) {
  try {
    const res = await fetch(`/api/transactions/${transactionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message?: unknown }).message)
          : `Update gagal (${res.status})`;
      return { ok: false as const, status: res.status, error: message, data };
    }
    return { ok: true as const, status: res.status, data };
  } catch {
    return {
      ok: false as const,
      status: 0,
      error: "Koneksi ke server gagal",
    };
  }
}

export async function fetchTransactionById(transactionId: number) {
  try {
    const res = await fetch(`/api/transactions/${transactionId}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message?: unknown }).message)
          : `Request gagal (${res.status})`;
      return { ok: false as const, status: res.status, error: message, data };
    }
    const record =
      data && typeof data === "object" && "data" in data
        ? (data as { data?: Transaction }).data ?? data
        : data;
    const items = Array.isArray(record?.items)
      ? (record.items as TransactionItem[])
      : Array.isArray(record?.itemsJson)
      ? (record.itemsJson as TransactionItem[])
      : [];
    const order = mapTransactionToOrder(record as Transaction, items);
    return { ok: true as const, status: res.status, data: order };
  } catch {
    return {
      ok: false as const,
      status: 0,
      error: "Koneksi ke server gagal",
    };
  }
}
