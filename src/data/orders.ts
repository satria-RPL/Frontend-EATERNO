import type { OrderFilter, OrderSummary } from "@/domain/orders/types";

export { type OrderFilter, type OrderSummary };

export const FILTERS = [
  { id: "all", label: "All", value: "all" },
  { id: "dinein", label: "Dine In", value: "dinein" },
  { id: "takeaway", label: "Take Away", value: "takeaway" },
] as const satisfies Array<{ id: string; label: string; value: OrderFilter }>;

export const ORDERS: OrderSummary[] = [
  {
    id: 1,
    type: "takeaway",
    title: "Order #001",
    table: "A1",
    itemsCount: 5,
    itemsPreview: ["Nasi Padang 3x", "Es Teh 2x"],
    itemsMoreCount: 10,
    timeAgo: "2 menit lalu",
  },
  {
    id: 2,
    type: "dinein",
    title: "Order #002",
    table: "B3",
    itemsCount: 4,
    itemsPreview: ["Ayam Bakar 2x", "Es Jeruk 2x"],
    itemsMoreCount: 6,
    timeAgo: "5 menit lalu",
  },
  {
    id: 3,
    type: "takeaway",
    title: "Order #003",
    table: "-",
    customer: "Dirga Hardeka",
    itemsCount: 5,
    itemsPreview: ["Nasi Padang 3x", "Es Teh 2x"],
    itemsMoreCount: 10,
    timeAgo: "2 menit lalu",
  },
  {
    id: 4,
    type: "dinein",
    title: "Order #004",
    table: "C2",
    itemsCount: 3,
    itemsPreview: ["Mie Goreng 1x", "Air Mineral 2x"],
    timeAgo: "8 menit lalu",
  },
  {
    id: 5,
    type: "takeaway",
    title: "Order #005",
    table: "-",
    customer: "Nadya",
    itemsCount: 2,
    itemsPreview: ["Sate Ayam 2x"],
    timeAgo: "10 menit lalu",
  },
  {
    id: 6,
    type: "dinein",
    title: "Order #006",
    table: "C4",
    itemsCount: 6,
    itemsPreview: ["Rendang 2x", "Es Teh 2x"],
    itemsMoreCount: 4,
    timeAgo: "12 menit lalu",
  },
  {
    id: 7,
    type: "takeaway",
    title: "Order #007",
    table: "D1",
    itemsCount: 1,
    itemsPreview: ["Kopi Hitam 1x"],
    timeAgo: "15 menit lalu",
  },
];
