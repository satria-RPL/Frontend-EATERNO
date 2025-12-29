import type { RefObject } from "react";
import type { OrderSummary } from "@/data/orders";

type OrderCardsProps = {
  orders: OrderSummary[];
  scrollRef: RefObject<HTMLDivElement | null>;
};

function getHeaderMeta(order: OrderSummary) {
  if (order.type === "takeaway") {
    return order.customer ?? "Take Away";
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
          order.type === "dinein"
            ? "Dine In"
            : order.type === "takeaway"
            ? "Take Away"
            : "Waitlist";
        const bodyClass =
          order.type === "dinein"
            ? "bg-rose-50"
            : order.type === "takeaway"
            ? "bg-orange-50"
            : "bg-amber-50";
        const buttonClass =
          order.type === "dinein"
            ? "bg-red-500 hover:bg-red-600"
            : order.type === "takeaway"
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-amber-500 hover:bg-amber-600";
        const previewItems = order.itemsPreview.slice(0, 1);
        const hiddenItems = order.itemsPreview.length - previewItems.length;
        const moreCount =
          (order.itemsMoreCount ?? 0) + (hiddenItems > 0 ? hiddenItems : 0);

        return (
          <div
            key={order.id}
            className="min-w-[282px] max-w-[282px] h-[127px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between gap-2 px-4 py-2 min-w-0">
              <p className="font-semibold text-sm text-gray-800 truncate">
                {order.title}
              </p>
              <span className="text-[11px] text-gray-500 truncate">
                {headerMeta}
              </span>
            </div>

            <div
              className={`border-t border-gray-200 px-4 py-2 ${bodyClass} flex flex-1 flex-col`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-gray-800">
                    Items
                  </span>
                  <span className="text-xs text-gray-500">
                    {order.itemsCount}x
                  </span>
                </div>
                <span className="text-[11px] font-semibold">{typeLabel}</span>
              </div>

              <div className="mt-1 space-y-0.5 text-[11px] text-gray-600 leading-tight">
                {previewItems.map((item, index) => (
                  <p key={`${order.id}-item-${index}`} className="truncate">
                    {item}
                  </p>
                ))}
                {moreCount > 0 ? (
                  <p className="text-[10px] text-gray-500">
                    ... {moreCount} items lainnya
                  </p>
                ) : null}
              </div>

              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-400">
                  {order.timeAgo}
                </span>
                <button
                  type="button"
                  className={`h-6 rounded-full px-4 text-[11px] font-semibold text-white transition ${buttonClass}`}
                >
                  Proses
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
