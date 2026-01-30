import type { OrderStatus } from "@/domain/orders/orderTypes";

export type OrderFilter = "all" | "dinein" | "takeaway";

export type OrderSummary = {
  id: number;
  type: Exclude<OrderFilter, "all">;
  title: string;
  table: string;
  customer?: string;
  itemsCount: number;
  itemsPreview: string[];
  itemsMoreCount?: number;
  timeAgo: string;
  timestamp?: number | null;
  itemSku?: string;
  itemAddons?: string[];
  transactionId?: number;
  transactionItemId?: number;
  transactionStatus?: OrderStatus;
  kitchenStatus?: "queued" | "proses" | "done";
  kitchenNote?: string;
  kitchenOrderId?: number;
};
