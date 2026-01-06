import type { Order } from "@/types/order";

type OrdersService = {
  fetchOrders: () => Promise<Order[]>;
};

function normalizeOrderCode(value: string) {
  return value.replace(/^#/, "");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createOrderPrintResolver({ fetchOrders }: OrdersService) {
  async function resolveOrderForPrint(code: string | null | undefined) {
    if (!code) return null;
    const target = normalizeOrderCode(code);
    if (!target) return null;

    const attempts = 5;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const orders = await fetchOrders();
      const match = orders.find(
        (order) => normalizeOrderCode(order.id) === target
      );
      if (match) return match;
      if (attempt < attempts - 1) {
        await sleep(500);
      }
    }
    return null;
  }

  return { resolveOrderForPrint };
}
