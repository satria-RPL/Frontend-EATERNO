import { Order, OrderStatus } from "@/types/order";

type TransactionItem = {
  qty?: number;
  price?: number | null;
  menuId?: number | null;
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
  customerName?: string | null;
  orderType?: string | null;
  tableId?: number | null;
  status?: string | null;
  items?: TransactionItem[];
  total?: number | null;
  tax?: number | null;
  discount?: number | null;
  paymentMethodId?: number | string | null;
  createdAt?: string | null;
};

type TransactionResponse = Transaction[] | { data?: Transaction[] };

function normalizeStatus(value: unknown): OrderStatus {
  if (value === "proses" || value === "cancel" || value === "selesai") {
    return value;
  }
  if (value === "done" || value === "finished" || value === "completed") {
    return "selesai";
  }
  if (value === "cancelled" || value === "canceled") {
    return "cancel";
  }
  if (value === "processing" || value === "process" || value === "pending") {
    return "proses";
  }
  return "proses";
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

function sumItems(items?: TransactionItem[]): number {
  return (items ?? []).reduce((total, item) => total + (item.qty ?? 0), 0);
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch("/api/transactions", { cache: "no-store" });
    const data = (await res.json().catch(() => null)) as
      | TransactionResponse
      | null;

    if (!res.ok || !data) {
      return [];
    }

    const transactions = Array.isArray(data) ? data : data.data ?? [];

    return transactions.map((tx) => {
      const detailItems =
        tx.items?.map((item) => {
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
        }) ?? [];

      return {
        id: `#${tx.id ?? "-"}`,
        name: normalizeName(tx),
        payment: normalizePayment(tx.paymentMethodId ?? null),
        price: tx.total ?? 0,
        items: sumItems(tx.items),
        date: tx.createdAt ?? new Date().toISOString(),
        status: normalizeStatus(tx.status ?? null),
        tax: tx.tax ?? 0,
        discount: tx.discount ?? 0,
        detailItems,
      };
    });
  } catch {
    return [];
  }
}
