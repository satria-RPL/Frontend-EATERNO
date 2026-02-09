"use client";

import { memo, type RefObject } from "react";
import { useRouter } from "next/navigation";
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

function parseTimeAgoToMinutes(value: string): number | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("baru")) return 0;
  if (normalized.includes("detik")) return 0;
  if (normalized.includes("kemarin")) return 24 * 60;

  const match = normalized.match(/(\d+)\s*(menit|jam|hari)/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;

  const unit = match[2];
  if (unit === "menit") return amount;
  if (unit === "jam") return amount * 60;
  if (unit === "hari") return amount * 24 * 60;
  return null;
}

function resolveUrgencyMixPercent(timeAgo: string): number {
  const minutes = parseTimeAgoToMinutes(timeAgo);
  if (minutes == null) return 0;

  const steps = [
    { minute: 0, mix: 0 },
    { minute: 30, mix: 10 },
    { minute: 60, mix: 20 },
    { minute: 180, mix: 35 },
    { minute: 720, mix: 50 },
    { minute: 1440, mix: 60 },
    { minute: 4320, mix: 75 },
    { minute: 10080, mix: 85 },
  ];

  for (let i = 0; i < steps.length - 1; i += 1) {
    const current = steps[i];
    const next = steps[i + 1];
    if (minutes <= current.minute) return current.mix;
    if (minutes <= next.minute) {
      const span = next.minute - current.minute;
      const progress = span === 0 ? 0 : (minutes - current.minute) / span;
      return Math.round(current.mix + (next.mix - current.mix) * progress);
    }
  }

  return steps[steps.length - 1].mix;
}

function OrderCardsComponent({ orders, scrollRef }: OrderCardsProps) {
  const router = useRouter();

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
        const baseColor =
          order.type === "dinein"
            ? "var(--kitchencard_dinein)"
            : "var(--kitchencard_takeaway)";
        const mutedBodyColor = `color-mix(in srgb, ${baseColor} 12%, white)`;
        const urgencyMix = resolveUrgencyMixPercent(order.timeAgo);
        const buttonColor = `color-mix(in srgb, ${baseColor} ${
          100 - urgencyMix
        }%, #ef4444 ${urgencyMix}%)`;

        return (
          <div
            key={order.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push("/main/orderhistory")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push("/main/orderhistory");
              }
            }}
            className="cv-auto w-[228px] h-[110px] shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col select-none cursor-pointer"
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

export const OrderCards = memo(OrderCardsComponent);
