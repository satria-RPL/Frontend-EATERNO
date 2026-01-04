import { normalizeStatus } from "@/domain/transactions/normalizeStatus";

type TransactionItem = {
  id?: number | string;
  menuId?: number | string;
  menu_id?: number | string;
  qty?: number | string;
  quantity?: number | string;
  count?: number | string;
  price?: number | string;
  sellPrice?: number | string;
  sellingPrice?: number | string;
  menu?: {
    id?: number | string;
    name?: string;
    image?: string;
    imageUrl?: string;
    image_url?: string;
  };
};

type TransactionRecord = {
  status?: string | null;
  items?: TransactionItem[];
  transactionItems?: TransactionItem[];
  transaction_items?: TransactionItem[];
  orderItems?: TransactionItem[];
  order_items?: TransactionItem[];
};

export type BestSellerItem = {
  id: string;
  name: string;
  price: number;
  sold: number;
  image: string;
};

const DEFAULT_FALLBACK_IMAGE = "/img/coffee.jpg";
const DEFAULT_MAX_ITEMS = 4;

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

function toStringValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickFirst(...values: unknown[]) {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return null;
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const candidates = [record.data, record.items, record.results, record.rows];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
    }
  }

  return [];
}

function resolveTransactionItems(record: TransactionRecord): TransactionItem[] {
  const items = pickFirst(
    record.items,
    record.transactionItems,
    record.transaction_items,
    record.orderItems,
    record.order_items
  );

  if (!Array.isArray(items)) return [];
  return items as TransactionItem[];
}

export function buildBestSellers(
  payload: unknown,
  options: { maxItems?: number; fallbackImage?: string } = {}
): BestSellerItem[] {
  const { maxItems = DEFAULT_MAX_ITEMS, fallbackImage = DEFAULT_FALLBACK_IMAGE } =
    options;
  const items = unwrapArray<TransactionItem>(payload);
  const map = new Map<string, BestSellerItem>();
  let fallbackIndex = 1;

  items.forEach((item) => {
    const qty = toNumber(item.qty ?? item.quantity ?? item.count) ?? 0;
    if (qty <= 0) return;

    const menuRecord = (item.menu ?? {}) as NonNullable<TransactionItem["menu"]>;
    const menuId = toStringValue(menuRecord.id ?? item.menuId ?? item.menu_id);
    const name =
      toStringValue(menuRecord.name) ??
      toStringValue((item as { name?: unknown }).name) ??
      "Menu";
    const key = menuId ?? name ?? `item-${fallbackIndex++}`;

    const price = toNumber(item.price ?? item.sellPrice ?? item.sellingPrice) ?? 0;
    const image =
      toStringValue(menuRecord.image ?? menuRecord.imageUrl ?? menuRecord.image_url) ??
      fallbackImage;

    const existing = map.get(key);
    if (existing) {
      existing.sold += qty;
      if (!existing.price && price) existing.price = price;
      if (existing.image === fallbackImage && image !== fallbackImage) {
        existing.image = image;
      }
      return;
    }

    map.set(key, {
      id: key,
      name,
      price,
      sold: qty,
      image,
    });
  });

  return Array.from(map.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, maxItems);
}

export function buildBestSellersFromTransactions(
  payload: unknown,
  options: { maxItems?: number; fallbackImage?: string } = {}
) {
  const transactions = unwrapArray<Record<string, unknown>>(payload);
  const items: TransactionItem[] = [];

  transactions.forEach((transaction) => {
    const record = asRecord(transaction);
    if (!record) return;
    if (normalizeStatus(record.status) !== "selesai") return;

    const transactionItems = resolveTransactionItems(
      record as TransactionRecord
    );
    if (transactionItems.length === 0) return;
    items.push(...transactionItems);
  });

  return buildBestSellers(items, options);
}
