import type { Order } from "@/types/order";

export type OrderHistoryService = {
  fetchOrders: () => Promise<Order[]>;
  voidOrder: (
    orderId: string | number,
    payload: { password: string }
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
    void reason;
    await voidOrder(orderId, { password: pin });
  }

  return { loadOrders, voidTransaction };
}
