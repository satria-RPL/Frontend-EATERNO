import { normalizeStatus } from "@/domain/transactions/normalizeStatus";
import { Order } from "@/types/order";

type TransactionItem = {
  qty?: number;
  price?: number | null;
  menuId?: number | null;
  transactionId?: number | null;
  transaction_id?: number | null;
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
    const options =
      item.variants?.map((variant) => ({
        label: variant.menuVariant?.name ?? "Varian",
        price: variant.extraPrice ?? 0,
      })) ?? [];
    return {
      name,
      qty,
      price,
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
      const detailItems = mapDetailItems(relatedItems);

      return {
        id: resolveTransactionCode(tx),
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
    });
  } catch {
    return [];
  }
}

export async function voidOrder(
  orderId: string,
  payload: { reason: string; pin: string }
) {
  const res = await fetch(`/api/orders/${orderId}/void`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Void gagal (${res.status})`);
  }
}
