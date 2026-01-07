import type { OrderSummary } from "@/domain/orders/types";

type KitchenOrderApiItem = Record<string, unknown>;
type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

export type KitchenOrdersService = {
  fetchKitchenOrders: () => Promise<ApiResult>;
};

type KitchenOrdersMapOptions = {
  splitByItem?: boolean;
};

type KitchenOrdersLoaderOptions = KitchenOrdersService & KitchenOrdersMapOptions;

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
    }
  }

  return [];
}

function expandTransactions(records: KitchenOrderApiItem[]) {
  const expanded: KitchenOrderApiItem[] = [];

  records.forEach((record) => {
    const transaction = asRecord(record);
    const items =
      transaction && Array.isArray(transaction.items)
        ? (transaction.items as KitchenOrderApiItem[])
        : null;

    if (items) {
      if (items.length === 0) {
        expanded.push({ transaction });
        return;
      }

      items.forEach((item) => {
        const itemRecord = asRecord(item) ?? { item };
        expanded.push({ ...itemRecord, transaction });
      });
      return;
    }

    expanded.push(record);
  });

  return expanded;
}

function normalizeOrderType(value: unknown): OrderSummary["type"] | null {
  const raw = toStringValue(value);
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/[\s_-]/g, "");

  if (["dinein", "dine"].includes(normalized)) return "dinein";
  if (["takeaway", "takeout", "togo"].includes(normalized)) return "takeaway";
  return null;
}

function formatTimeAgo(value: unknown): string {
  const timestamp = toTimestamp(value);
  if (timestamp == null) return "Baru saja";
  const diffMs = Date.now() - timestamp;
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "Baru saja";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function resolveType(
  item: Record<string, unknown>,
  transaction: Record<string, unknown> | null
): OrderSummary["type"] {
  const typeValue = normalizeOrderType(
    pickFirst(
      item.orderType,
      item.order_type,
      item.type,
      transaction?.orderType,
      transaction?.order_type,
      transaction?.type,
      transaction?.serviceType,
      transaction?.service_type
    )
  );

  if (typeValue) return typeValue;

  const tableValue = pickFirst(
    transaction?.table,
    transaction?.tableNo,
    transaction?.table_no,
    transaction?.tableNumber,
    transaction?.table_number,
    transaction?.tableId,
    transaction?.table_id,
    item.table,
    item.tableNo,
    item.table_no,
    item.tableNumber,
    item.table_number
  );

  return tableValue != null ? "dinein" : "takeaway";
}

function resolveTitle(
  item: Record<string, unknown>,
  transaction: Record<string, unknown> | null,
  fallbackId: string | null
) {
  const rawOrder = pickFirst(
    transaction?.code,
    transaction?.orderNumber,
    transaction?.order_no,
    transaction?.invoiceNumber,
    transaction?.invoice_no,
    transaction?.receiptNumber,
    transaction?.receipt_no,
    item.orderNumber,
    item.order_no,
    item.orderCode,
    item.order_code,
    item.transactionId,
    item.transaction_id,
    transaction?.id,
    item.orderId,
    item.order_id,
    item.id
  );

  const orderNumber = toStringValue(rawOrder);
  if (orderNumber) return `Order #${orderNumber}`;
  if (fallbackId) return `Order #${fallbackId}`;
  return "Order";
}

function resolveTable(
  item: Record<string, unknown>,
  transaction: Record<string, unknown> | null
) {
  const rawTable = pickFirst(
    transaction?.table,
    transaction?.tableNo,
    transaction?.table_no,
    transaction?.tableNumber,
    transaction?.table_number,
    transaction?.tableId,
    transaction?.table_id,
    item.table,
    item.tableNo,
    item.table_no,
    item.tableNumber,
    item.table_number
  );

  return toStringValue(rawTable) ?? "-";
}

function resolveCustomer(
  item: Record<string, unknown>,
  transaction: Record<string, unknown> | null
) {
  const rawCustomer = pickFirst(
    transaction?.name,
    transaction?.customer,
    transaction?.customerName,
    transaction?.customer_name,
    transaction?.guestName,
    transaction?.guest_name,
    item.name,
    item.customer,
    item.customerName,
    item.customer_name
  );

  return toStringValue(rawCustomer) ?? undefined;
}

function resolveTimeAgo(
  item: Record<string, unknown>,
  transaction: Record<string, unknown> | null
) {
  const rawTime = pickFirst(
    item.startedAt,
    item.started_at,
    item.createdAt,
    item.created_at,
    transaction?.createdAt,
    transaction?.created_at,
    item.finishedAt,
    item.finished_at
  );

  return formatTimeAgo(rawTime);
}

function resolveTimestamp(
  item: Record<string, unknown>,
  transaction: Record<string, unknown> | null
) {
  const rawTime = pickFirst(
    item.startedAt,
    item.started_at,
    item.createdAt,
    item.created_at,
    transaction?.createdAt,
    transaction?.created_at,
    item.finishedAt,
    item.finished_at
  );

  return toTimestamp(rawTime);
}

function resolveItemLabels(
  item: Record<string, unknown>,
  transactionItem: Record<string, unknown> | null
) {
  const menuRecord = asRecord(
    pickFirst(
      transactionItem?.menu,
      transactionItem?.menuItem,
      transactionItem?.menu_item,
      item.menu,
      item.menuItem,
      item.menu_item
    )
  );
  const productRecord = asRecord(
    pickFirst(transactionItem?.product, item.product)
  );

  const itemName = toStringValue(
    pickFirst(
      transactionItem?.name,
      transactionItem?.menuName,
      transactionItem?.menu_name,
      menuRecord?.name,
      productRecord?.name,
      item.itemName,
      item.menuName,
      item.menu_name,
      item.productName,
      item.product_name,
      item.name
    )
  );

  const qty = toNumber(
    pickFirst(
      transactionItem?.qty,
      transactionItem?.quantity,
      transactionItem?.count,
      transactionItem?.total_qty,
      item.qty,
      item.quantity,
      item.count
    )
  );

  const note = toStringValue(pickFirst(item.note, transactionItem?.note));

  const labels: string[] = [];

  if (itemName) {
    labels.push(qty != null && qty > 1 ? `${itemName} ${qty}x` : itemName);
  } else {
    const fallbackItemId = toStringValue(
      pickFirst(item.transactionItemId, item.transaction_item_id, item.id)
    );
    labels.push(fallbackItemId ? `Item #${fallbackItemId}` : "Item");
  }

  if (note) {
    labels.push(`Note: ${note}`);
  }

  return labels;
}

function resolveItemSku(
  item: Record<string, unknown>,
  transactionItem: Record<string, unknown> | null
) {
  const menuRecord = asRecord(
    pickFirst(
      transactionItem?.menu,
      transactionItem?.menuItem,
      transactionItem?.menu_item,
      item.menu,
      item.menuItem,
      item.menu_item
    )
  );
  const productRecord = asRecord(
    pickFirst(transactionItem?.product, item.product)
  );

  return toStringValue(
    pickFirst(
      transactionItem?.sku,
      transactionItem?.productSku,
      transactionItem?.product_sku,
      menuRecord?.sku,
      productRecord?.sku,
      item.sku,
      item.productSku,
      item.product_sku
    )
  );
}

function resolveItemAddons(
  item: Record<string, unknown>,
  transactionItem: Record<string, unknown> | null
) {
  const rawVariants = pickFirst(
    transactionItem?.variants,
    transactionItem?.variant,
    transactionItem?.options,
    item.variants,
    item.variant,
    item.options
  );

  const variants = Array.isArray(rawVariants) ? rawVariants : [];

  const addons = variants
    .map((variant) => asRecord(variant))
    .filter((variant): variant is Record<string, unknown> => variant != null)
    .map((variant) => {
      const menuVariant = asRecord(
        pickFirst(
          variant.menuVariant,
          variant.menu_variant,
          variant.variant,
          variant.option
        )
      );
      return toStringValue(
        pickFirst(
          variant.name,
          variant.optionName,
          variant.option_name,
          menuVariant?.name
        )
      );
    })
    .filter((name): name is string => Boolean(name));

  return addons.length > 0 ? addons : undefined;
}
function resolveCategoryId(
  item: Record<string, unknown>,
  transactionItem: Record<string, unknown> | null
) {
  const menuRecord = asRecord(
    pickFirst(
      transactionItem?.menu,
      transactionItem?.menuItem,
      transactionItem?.menu_item,
      item.menu,
      item.menuItem,
      item.menu_item
    )
  );
  const productRecord = asRecord(
    pickFirst(transactionItem?.product, item.product)
  );

  return toNumber(
    pickFirst(
      transactionItem?.categoryId,
      transactionItem?.category_id,
      menuRecord?.categoryId,
      menuRecord?.category_id,
      productRecord?.categoryId,
      productRecord?.category_id,
      item.categoryId,
      item.category_id
    )
  );
}

function resolveItemCount(
  item: Record<string, unknown>,
  transactionItem: Record<string, unknown> | null
) {
  const qty = toNumber(
    pickFirst(
      transactionItem?.qty,
      transactionItem?.quantity,
      transactionItem?.count,
      transactionItem?.total_qty,
      item.qty,
      item.quantity,
      item.count
    )
  );

  if (qty == null) return 1;
  return qty > 0 ? qty : 0;
}

function mapKitchenOrdersGrouped(payload: unknown): OrderSummary[] {
  const rawItems = unwrapArray<KitchenOrderApiItem>(payload);
  const items = expandTransactions(rawItems);
  if (items.length === 0) return [];

  const grouped = new Map<string, { summary: OrderSummary; index: number }>();
  let fallbackId = 1;

  items.forEach((item, index) => {
    const record = asRecord(item) ?? {};
    const transactionItem = asRecord(
      pickFirst(
        record.transactionItem,
        record.transaction_item,
        record.transactionItemDetail,
        record.transaction_item_detail
      )
    );
    const transaction = asRecord(
      pickFirst(record.transaction, transactionItem?.transaction, record.order)
    );

    const groupIdRaw = pickFirst(
      transaction?.id,
      transaction?.transactionId,
      transaction?.transaction_id,
      record.transactionId,
      record.transaction_id,
      record.orderId,
      record.order_id
    );

    const groupKey =
      toStringValue(groupIdRaw) ??
      toStringValue(record.id) ??
      toStringValue(record.transactionItemId) ??
      `item-${index}`;

    const labels = resolveItemLabels(record, transactionItem);
    const itemCount = resolveItemCount(record, transactionItem);
    const existing = grouped.get(groupKey);

    if (existing) {
      existing.summary.itemsPreview.push(...labels);
      existing.summary.itemsCount += itemCount;
      return;
    }

    const summaryId =
      toNumber(groupIdRaw) ??
      toNumber(record.id) ??
      toNumber(record.transactionItemId) ??
      fallbackId++;

    const fallbackTitleId =
      toStringValue(groupIdRaw) ?? toStringValue(summaryId);

    const summary: OrderSummary = {
      id: summaryId,
      type: resolveType(record, transaction),
      title: resolveTitle(record, transaction, fallbackTitleId),
      table: resolveTable(record, transaction),
      customer: resolveCustomer(record, transaction),
      itemsCount: itemCount,
      itemsPreview: labels,
      timeAgo: resolveTimeAgo(record, transaction),
      itemSku: resolveItemSku(record, transactionItem),
      itemAddons: resolveItemAddons(record, transactionItem),
    };

    grouped.set(groupKey, { summary, index });
  });

  return Array.from(grouped.values())
    .sort((a, b) => {
      if (a.summary.id !== b.summary.id) {
        return a.summary.id - b.summary.id;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.summary);
}

function mapKitchenOrdersSplit(payload: unknown): OrderSummary[] {
  const rawItems = unwrapArray<KitchenOrderApiItem>(payload);
  const items = expandTransactions(rawItems);
  if (items.length === 0) return [];

  let fallbackId = 1;
  const summaries: Array<{
    summary: OrderSummary;
    categoryId: number | null;
    index: number;
  }> = [];

  items.forEach((item, index) => {
    const record = asRecord(item) ?? {};
    const transactionItem = asRecord(
      pickFirst(
        record.transactionItem,
        record.transaction_item,
        record.transactionItemDetail,
        record.transaction_item_detail
      )
    );
    const transaction = asRecord(
      pickFirst(record.transaction, transactionItem?.transaction, record.order)
    );

    const idRaw = pickFirst(
      transaction?.id,
      transaction?.transactionId,
      transaction?.transaction_id,
      record.transactionId,
      record.transaction_id,
      record.orderId,
      record.order_id,
      record.transactionItemId,
      record.transaction_item_id,
      record.id
    );

    const labels = resolveItemLabels(record, transactionItem);
    const itemCount = resolveItemCount(record, transactionItem);

    const summaryId =
      toNumber(idRaw) ??
      toNumber(record.transactionItemId) ??
      toNumber(record.transaction_item_id) ??
      toNumber(record.id) ??
      fallbackId++;

    const fallbackTitleId =
      toStringValue(idRaw) ?? toStringValue(summaryId);

    const summary: OrderSummary = {
      id: summaryId,
      type: resolveType(record, transaction),
      title: resolveTitle(record, transaction, fallbackTitleId),
      table: resolveTable(record, transaction),
      customer: resolveCustomer(record, transaction),
      itemsCount: itemCount,
      itemsPreview: labels,
      timeAgo: resolveTimeAgo(record, transaction),
      itemSku: resolveItemSku(record, transactionItem),
      itemAddons: resolveItemAddons(record, transactionItem),
    };

    summaries.push({
      summary,
      categoryId: resolveCategoryId(record, transactionItem),
      index,
    });
  });

  return summaries
    .sort((a, b) => {
      const categoryA = a.categoryId ?? Number.POSITIVE_INFINITY;
      const categoryB = b.categoryId ?? Number.POSITIVE_INFINITY;
      if (categoryA !== categoryB) {
        return categoryA - categoryB;
      }
      if (a.summary.id !== b.summary.id) {
        return a.summary.id - b.summary.id;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.summary);
}

export function createKitchenOrdersLoader({
  fetchKitchenOrders,
  splitByItem = true,
}: KitchenOrdersLoaderOptions) {
  async function loadKitchenOrders(): Promise<{
    orders: OrderSummary[];
    error: string | null;
  }> {
    const result = await fetchKitchenOrders();
    if (!result.ok) {
      return {
        orders: [],
        error: result.error || "Gagal memuat order.",
      };
    }

    return {
      orders: splitByItem
        ? mapKitchenOrdersSplit(result.data)
        : mapKitchenOrdersGrouped(result.data),
      error: null,
    };
  }

  return { loadKitchenOrders };
}
