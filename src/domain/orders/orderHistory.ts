import type { Order } from "@/types/order";

export type OrderHistoryService = {
  fetchOrders: () => Promise<Order[]>;
  voidOrder: (orderId: string, payload: { reason: string; pin: string }) => Promise<void>;
};

export function createOrderHistoryActions({
  fetchOrders,
  voidOrder,
}: OrderHistoryService) {
  async function loadOrders() {
    return fetchOrders();
  }

  async function voidTransaction(orderId: string, reason: string, pin: string) {
    await voidOrder(orderId, { reason, pin });
  }

  return { loadOrders, voidTransaction };
}
