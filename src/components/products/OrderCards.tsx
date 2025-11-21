import type { RefObject } from "react";
import type { OrderSummary } from "@/data/orders";
type OrderCardsProps = {
  orders: OrderSummary[];
  scrollRef: RefObject<HTMLDivElement | null>;
};

export function OrderCards({ orders, scrollRef }: OrderCardsProps) {
  return (
    <div
      className="mt-6 flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth"
      ref={scrollRef}
    >
      {orders.map((order) => (
        <div
          key={order.id}
          className="min-w-[300px] min-h-[150px] border-gray-400 border rounded-xl p-4 shadow-md bg-white flex flex-col gap-1"
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">{order.title}</p>
            <span className="text-[10px] uppercase text-gray-400">
              {order.type}
            </span>
          </div>
          <p className="text-xs text-gray-500">Table: {order.table}</p>
        </div>
      ))}
    </div>
  );
}
