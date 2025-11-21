export type OrderStatus = "proses" | "cancel" | "selesai";

export interface Order {
  id: string;
  name: string;
  payment: string;
  price: number;
  items: number;
  date: string; // ISO yyyy-mm-dd
  status: OrderStatus;
}
