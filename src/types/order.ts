export type OrderStatus = "proses" | "cancel" | "selesai";

export type OrderDetailItemOption = {
  label: string;
  price?: number;
};

export type OrderDetailItem = {
  name: string;
  qty: number;
  price: number;
  options?: OrderDetailItemOption[];
};

export interface Order {
  id: string;
  name: string;
  payment: string;
  price: number;
  items: number;
  date: string;
  status: OrderStatus;
  tax?: number;
  discount?: number;
  detailItems?: OrderDetailItem[];
}
