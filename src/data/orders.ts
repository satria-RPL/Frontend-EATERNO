export const FILTERS = [
  { id: "all", label: "All", value: "all" },
  { id: "waitlist", label: "Waitlist", value: "waitlist" },
  { id: "dinein", label: "Dine In", value: "dinein" },
  { id: "takeaway", label: "Take Away", value: "takeaway" },
] as const;

export type OrderFilter = (typeof FILTERS)[number]["value"];

export type OrderSummary = {
  id: number;
  type: OrderFilter;
  title: string;
  table: string;
};

export const ORDERS: OrderSummary[] = [
  { id: 1, type: "waitlist", title: "Order #001", table: "A1" },
  { id: 2, type: "dinein", title: "Order #002", table: "B3" },
  { id: 3, type: "takeaway", title: "Order #003", table: "-" },
  { id: 4, type: "dinein", title: "Order #004", table: "C2" },
  { id: 5, type: "takeaway", title: "Order #005", table: "D2" },
  { id: 6, type: "dinein", title: "Order #006", table: "C4" },
  { id: 7, type: "waitlist", title: "Order #007", table: "D1" },
];
