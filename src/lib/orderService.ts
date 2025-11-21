import { Order } from "@/types/order";
import ordersJson from "@/data/orders.json";

export async function fetchOrders(): Promise<Order[]> {
  // Simulasi fetch, nanti ganti call API
  return new Promise((res) => setTimeout(() => res(ordersJson as Order[]), 200));
}
