import type { OrderSummary } from "@/domain/orders/types";
import {
  createKitchenOrderStatus,
  updateKitchenOrderStatus,
} from "@/lib/services/kitchenOrderService";
import { updateTransactionStatus } from "@/lib/services/orderService";

type UpdateKitchenStatusInput = {
  order: OrderSummary;
  nextStatus: OrderSummary["kitchenStatus"];
  orders: OrderSummary[];
  statusOverrides: Record<string, OrderSummary["kitchenStatus"]>;
};

type UpdateKitchenStatusResult =
  | { ok: true; createdId?: number }
  | { ok: false; error?: string };

function getStatusKey(order: OrderSummary) {
  return `${order.transactionId ?? "t"}:${order.transactionItemId ?? order.id}`;
}

async function applyTransactionReady(
  order: OrderSummary,
  nextStatus: OrderSummary["kitchenStatus"],
  orders: OrderSummary[],
  statusOverrides: Record<string, OrderSummary["kitchenStatus"]>
) {
  if (nextStatus !== "done") return;
  if (order.transactionId == null) return;
  const related = orders.filter(
    (item) => item.transactionId === order.transactionId
  );
  if (related.length === 0) return;
  const allDone = related.every((item) => {
    const itemKey = getStatusKey(item);
    const resolved = statusOverrides[itemKey] ?? item.kitchenStatus ?? "queued";
    return resolved === "done";
  });
  if (!allDone) return;
  await updateTransactionStatus(order.transactionId, "ready_to_pickup");
}

export async function updateKitchenStatus({
  order,
  nextStatus,
  orders,
  statusOverrides,
}: UpdateKitchenStatusInput): Promise<UpdateKitchenStatusResult> {
  if (order.kitchenOrderId) {
    const result = await updateKitchenOrderStatus(
      order.kitchenOrderId,
      nextStatus ?? "queued"
    );
    if (result.ok) {
      await applyTransactionReady(order, nextStatus, orders, statusOverrides);
      return { ok: true };
    }
    return { ok: false, error: "Gagal mengubah status kitchen." };
  }

  if (order.transactionItemId != null) {
    const created = await createKitchenOrderStatus({
      transactionItemId: order.transactionItemId,
      status: nextStatus ?? "queued",
      note: order.kitchenNote ?? null,
    });
    if (created.ok) {
      const createdId =
        typeof created.data === "object" && created.data
          ? (created.data as { id?: number }).id
          : undefined;
      await applyTransactionReady(order, nextStatus, orders, statusOverrides);
      return { ok: true, createdId };
    }
    return { ok: false, error: "Gagal membuat status kitchen." };
  }

  return { ok: false, error: "Data kitchen order tidak lengkap." };
}
