import type { OrderSummary } from "@/data/orders";

type KitchenOrderApiItem = Record<string, unknown>;
type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

export type KitchenOrdersService = {
  fetchKitchenOrders: () => Promise<ApiResult>;
};

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

function normalizeOrderType(value: unknown): OrderSummary["type"] | null {
  const raw = toStringValue(value);
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/[\s_-]/g, "");

  if (["dinein", "dine"].includes(normalized)) return "dinein";
  if (["takeaway", "takeout", "togo"].includes(normalized)) return "takeaway";
  if (["waitlist", "waiting", "queued", "queue", "pending"].includes(normalized)) {
    return "waitlist";
  }

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

  const statusValue = normalizeOrderType(
    pickFirst(
      item.status,
      item.orderStatus,
      item.order_status,
      transaction?.status,
      transaction?.orderStatus,
      transaction?.order_status
    )
  );

  return statusValue ?? "waitlist";
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
    transaction?.customer,
    transaction?.customerName,
    transaction?.customer_name,
    transaction?.guestName,
    transaction?.guest_name,
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

  return qty != null && qty > 0 ? qty : 1;
}

export function mapKitchenOrders(payload: unknown): OrderSummary[] {
  const items = unwrapArray<KitchenOrderApiItem>(payload);
  if (items.length === 0) return [];

  const grouped = new Map<string, OrderSummary>();
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

    const existing = grouped.get(groupKey);
    const labels = resolveItemLabels(record, transactionItem);
    const itemCount = resolveItemCount(record, transactionItem);

    if (existing) {
      existing.itemsPreview.push(...labels);
      existing.itemsCount += itemCount;
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
    };

    grouped.set(groupKey, summary);
  });

  return Array.from(grouped.values());
}

export function createKitchenOrdersLoader({
  fetchKitchenOrders,
}: KitchenOrdersService) {
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
      orders: mapKitchenOrders(result.data),
      error: null,
    };
  }

  return { loadKitchenOrders };
}
