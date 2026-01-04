type RecordValue = Record<string, unknown>;

export type CategoryLookup = {
  menuCategoryMap: Map<string, string>;
  categoryLabelMap: Map<string, string>;
};

export type CategoryMeta = {
  key: string;
  label: string;
};

const OTHER_KEY = "cat-other";
const OTHER_LABEL = "Others";

function asRecord(value: unknown): RecordValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as RecordValue;
}

function pickFirst(...values: unknown[]) {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return null;
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

function toStringValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function toTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function unwrapArray<T>(payload: unknown): T[] {
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
    }
  }

  return [];
}

export function buildCategoryLookup(
  menusPayload: unknown,
  categoriesPayload: unknown
): CategoryLookup {
  const menuCategoryMap = new Map<string, string>();
  const categoryLabelMap = new Map<string, string>();

  unwrapArray<RecordValue>(menusPayload).forEach((menu) => {
    const id = toStringValue(menu.id ?? menu.menuId ?? menu.menu_id);
    const categoryId = toStringValue(menu.categoryId ?? menu.category_id);
    if (!id || !categoryId) return;
    menuCategoryMap.set(id, categoryId);
  });

  unwrapArray<RecordValue>(categoriesPayload).forEach((category) => {
    const id = toStringValue(
      category.id ?? category.categoryId ?? category.category_id
    );
    if (!id) return;
    const label =
      toStringValue(category.label) ??
      toStringValue(category.name) ??
      toStringValue(category.title) ??
      toStringValue(category.description) ??
      `Kategori ${id}`;
    categoryLabelMap.set(id, label);
  });

  return { menuCategoryMap, categoryLabelMap };
}

export function resolveTransactionItems(record: RecordValue): RecordValue[] {
  const items = pickFirst(
    record.items,
    record.transactionItems,
    record.transaction_items,
    record.orderItems,
    record.order_items,
    record.details,
    record.detailItems
  );

  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object") as RecordValue[];
}

export function resolveTransactionDate(record: RecordValue): number | null {
  const raw = pickFirst(
    record.createdAt,
    record.created_at,
    record.date,
    record.transactionDate,
    record.transaction_date
  );
  return toTimestamp(raw);
}

export function resolveItemQty(item: RecordValue): number {
  const qty = toNumber(
    pickFirst(item.qty, item.quantity, item.count, item.total_qty)
  );
  if (qty == null) return 1;
  return qty > 0 ? qty : 0;
}

export function resolveItemTotal(item: RecordValue, qty: number): number {
  const total = toNumber(
    pickFirst(
      item.total,
      item.subtotal,
      item.amount,
      item.totalPrice,
      item.total_price,
      item.lineTotal,
      item.line_total
    )
  );
  if (total != null) return total;

  const price = toNumber(
    pickFirst(item.price, item.sellPrice, item.sellingPrice)
  );
  if (price == null) return 0;
  if (qty <= 0) return 0;
  return price * qty;
}

export function resolveCategoryMeta(
  item: RecordValue,
  lookup: CategoryLookup
): CategoryMeta {
  const menuRecord = asRecord(item.menu);
  const categoryRecord = asRecord(item.category);

  const categoryId = toStringValue(
    pickFirst(
      item.categoryId,
      item.category_id,
      menuRecord?.categoryId,
      menuRecord?.category_id,
      categoryRecord?.id,
      categoryRecord?.categoryId,
      categoryRecord?.category_id
    )
  );

  const menuId = toStringValue(
    pickFirst(
      item.menuId,
      item.menu_id,
      menuRecord?.id,
      menuRecord?.menuId,
      menuRecord?.menu_id
    )
  );

  const resolvedCategoryId =
    categoryId ?? (menuId ? lookup.menuCategoryMap.get(menuId) : null);

  if (!resolvedCategoryId) {
    return { key: OTHER_KEY, label: OTHER_LABEL };
  }

  const label =
    lookup.categoryLabelMap.get(resolvedCategoryId) ??
    `Kategori ${resolvedCategoryId}`;

  return {
    key: `cat-${resolvedCategoryId}`,
    label,
  };
}
