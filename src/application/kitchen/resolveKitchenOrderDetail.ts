import type { Order } from "@/domain/orders/orderTypes";
import type { OrderSummary } from "@/domain/orders/types";
import { fetchOrders, fetchTransactionById } from "@/lib/services/orderService";

type ResolveDetailResult = {
  order: Order | null;
  ordersCache: Order[] | null;
};

export async function resolveKitchenOrderDetail(
  summary: OrderSummary,
  cachedOrders: Order[] | null
): Promise<ResolveDetailResult> {
  const transactionId = summary.transactionId ?? null;
  let resolvedOrder: Order | null = null;

  if (transactionId != null) {
    const result = await fetchTransactionById(transactionId);
    if (result.ok) {
      resolvedOrder = result.data;
    }
  }

  let ordersCache = cachedOrders ?? null;
  if (!resolvedOrder) {
    if (!ordersCache) {
      ordersCache = await fetchOrders();
    }
    const matched =
      transactionId != null
        ? ordersCache?.find(
            (item) => item.id.replace(/\D/g, "") === String(transactionId)
          ) ?? null
        : ordersCache?.find(
            (item) => item.id.replace(/\D/g, "") === String(summary.id)
          ) ?? null;

    resolvedOrder = matched ?? null;
  }

  return { order: resolvedOrder, ordersCache };
}
