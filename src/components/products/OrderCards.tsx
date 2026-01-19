import type { RefObject } from "react";
import type { OrderSummary } from "@/data/orders";

type OrderCardsProps = {
  orders: OrderSummary[];
  scrollRef: RefObject<HTMLDivElement | null>;
};

function getHeaderMeta(order: OrderSummary) {
  if (order.type === "takeaway") {
    return order.customer ?? "Customer";
  }

  return order.table === "-" ? "Table -" : `Table ${order.table}`;
}

export function OrderCards({ orders, scrollRef }: OrderCardsProps) {
  return (
    <div
      className="mt-6 flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth"
      ref={scrollRef}
    >
      {orders.map((order) => {
        const headerMeta = getHeaderMeta(order);
        const typeLabel =
          order.type === "dinein" ? "Dine In" : "Take Away";
        const status = order.transactionStatus ?? "proses";
        const statusLabel =
          status === "ready_to_pickup" ? "Ready to Pickup" : "Proses";
        const bodyColor =
          order.type === "dinein"
            ? "var(--kichencard_dinein1)"
            : "var(--kichencard_takeaway)";
        const buttonColor =
          order.type === "dinein"
            ? "var(--kichencard_dinein2)"
            : "var(--kichencard_takeaway2)";
        const mutedBodyColor = `color-mix(in srgb, ${buttonColor} 12%, white)`;

        return (
          <div
            key={order.id}
            className="w-[228px] h-[110px] shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between gap-2 px-4 py-2 min-w-0">
              <p className="font-semibold text-sm text-default truncate">
                {order.title}
              </p>
              <span className="text-[11px] text-gray-500 truncate">
                {headerMeta}
              </span>
            </div>

            <div
              className="border-t border-gray-200 px-4 py-2 flex flex-1 flex-col gap-2"
              style={{ backgroundColor: mutedBodyColor }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-default">
                    Items
                  </span>
                  <span className="text-xs text-gray-600">
                    {order.itemsCount}x
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-default">
                  {typeLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600">
                  {order.timeAgo}
                </span>
                <span
                  className="h-6 rounded-full px-4 text-[11px] font-semibold text-white flex items-center hover:opacity-90"
                  style={{ backgroundColor: buttonColor }}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
