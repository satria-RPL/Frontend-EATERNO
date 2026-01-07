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
  itemSku?: string;
  itemAddons?: string[];
};
