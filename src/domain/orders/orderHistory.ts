import type { Order } from "@/domain/orders/orderTypes";

export type OrderHistoryService = {
  fetchOrders: () => Promise<Order[]>;
  voidOrder: (
    orderId: string | number,
    payload: { password: string; voidReason?: string; reason?: string }
  ) => Promise<void>;
};

export function createOrderHistoryActions({
  fetchOrders,
  voidOrder,
}: OrderHistoryService) {
  async function loadOrders() {
    return fetchOrders();
  }

  async function voidTransaction(
    orderId: string | number,
    reason: string,
    pin: string
  ) {
    const trimmedReason = reason.trim();
    await voidOrder(orderId, {
      password: pin,
      voidReason: trimmedReason ? trimmedReason : undefined,
      reason: trimmedReason ? trimmedReason : undefined,
    });
  }

  return { loadOrders, voidTransaction };
}
