import { applyKitchenOrderStatuses, createKitchenOrdersLoader } from "@/domain/kitchenOrders";
import type { OrderSummary } from "@/domain/orders/types";
import {
  createKitchenOrderStatus,
  fetchKitchenOrders,
  fetchKitchenOrderStatuses,
} from "@/lib/services/kitchenOrderService";

const { loadKitchenOrders } = createKitchenOrdersLoader({ fetchKitchenOrders });

type LoadKitchenOrdersResult =
  | { ok: true; orders: OrderSummary[] }
  | { ok: false; orders: OrderSummary[]; error: string };

function getStatusKey(order: OrderSummary) {
  return `${order.transactionId ?? "t"}:${order.transactionItemId ?? order.id}`;
}

export async function loadKitchenOrdersSnapshot(): Promise<LoadKitchenOrdersResult> {
  const result = await loadKitchenOrders();
  if (result.error) {
    return { ok: false, orders: [], error: result.error };
  }

  const statuses = await fetchKitchenOrderStatuses();
  const merged = statuses.ok
    ? applyKitchenOrderStatuses(result.orders, statuses.data)
    : result.orders;

  const missing = merged.filter(
    (order) => order.transactionItemId != null && order.kitchenOrderId == null
  );

  if (missing.length === 0) {
    return { ok: true, orders: merged };
  }

  const createdMap = new Map<string, number>();
  for (const order of missing) {
    const created = await createKitchenOrderStatus({
      transactionItemId: order.transactionItemId!,
      status: "queued",
      note: order.kitchenNote ?? null,
    });
    const createdId =
      created.ok &&
      typeof created.data === "object" &&
      created.data
        ? (created.data as { id?: number }).id
        : undefined;
    if (createdId) {
      createdMap.set(getStatusKey(order), createdId);
    }
  }

  if (createdMap.size === 0) {
    return { ok: true, orders: merged };
  }

  return {
    ok: true,
    orders: merged.map((order) => {
      const createdId = createdMap.get(getStatusKey(order));
      return createdId ? { ...order, kitchenOrderId: createdId } : order;
    }),
  };
}
