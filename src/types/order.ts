export type OrderStatus = "proses" | "ready_to_pickup" | "selesai" | "cancel";

export type OrderDetailItemOption = {
  label: string;
  price?: number;
};

export type OrderDetailItem = {
  name: string;
  qty: number;
  price: number;
  options?: OrderDetailItemOption[];
  note?: string;
};

export interface Order {
  id: string;
  transactionId?: number | null;
  note?: string | null;
  name: string;
  payment: string;
  price: number;
  items: number;
  date: string;
  status: OrderStatus;
  tax?: number;
  discount?: number;
  customerName?: string | null;
  orderType?: string | null;
  tableId?: number | null;
  createdAt?: string | null;
  detailItems?: OrderDetailItem[];
}
