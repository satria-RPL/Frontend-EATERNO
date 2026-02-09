"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, RotateCcw } from "lucide-react";
import { loadKitchenOrdersSnapshot } from "@/application/kitchen/loadKitchenOrders";
import { resolveKitchenOrderDetail } from "@/application/kitchen/resolveKitchenOrderDetail";
import { updateKitchenStatus } from "@/application/kitchen/updateKitchenStatus";
import type { Order } from "@/types/order";
import OrderDetailKitchenModal from "@/components/modals/OrderDetailKitchenModal";

import type { OrderSummary } from "@/data/orders";
import { usePolling } from "@/lib/hooks/usePolling";

type KitchenFilter = "all" | "dinein" | "takeaway" | "done" | "void";

const FILTERS: Array<{ id: KitchenFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "dinein", label: "Dine In" },
  { id: "takeaway", label: "TakeAway" },
  { id: "done", label: "Selesai" },
  { id: "void", label: "Void / Dibatalkan" },
];

export default function KitchenListClient() {
  const isActiveRef = useRef(true);
  const [activeFilter, setActiveFilter] = useState<KitchenFilter>("all");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailOrders, setDetailOrders] = useState<Order[] | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<OrderSummary | null>(
    null
  );
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, OrderSummary["kitchenStatus"]>
  >({});

  const getStatusKey = useCallback(
    (order: OrderSummary) =>
      `${order.transactionId ?? "t"}:${order.transactionItemId ?? order.id}`,
    []
  );

  const getEffectiveStatus = useCallback(
    (order: OrderSummary) => {
      const key = getStatusKey(order);
      return statusOverrides[key] ?? order.kitchenStatus ?? "queued";
    },
    [getStatusKey, statusOverrides]
  );

  const isVoidOrder = useCallback(
    (order: OrderSummary) => order.transactionStatus === "cancel",
    []
  );

  const loadOrders = useCallback(async () => {
    if (!isActiveRef.current) return;
    setIsLoading(true);
    const result = await loadKitchenOrdersSnapshot();
    if (!isActiveRef.current) return;
    if (!result.ok) {
      console.error("Failed to load kitchen orders", result.error);
      setOrders([]);
      setIsLoading(false);
      return;
    }
    const merged = result.orders;
    setOrders((prev) => {
      const voidOrders = prev.filter(isVoidOrder);
      if (voidOrders.length === 0) return merged;
      const nextMap = new Map<string, OrderSummary>();
      merged.forEach((order) => nextMap.set(getStatusKey(order), order));
      voidOrders.forEach((order) => {
        const key = getStatusKey(order);
        if (!nextMap.has(key)) {
          nextMap.set(key, order);
        }
      });
      return Array.from(nextMap.values());
    });
    setStatusOverrides({});
    setIsLoading(false);
  }, [
    getStatusKey,
    isVoidOrder,
  ]);

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  usePolling(loadOrders, { intervalMs: 15000, immediate: true });

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") {
      return orders.filter(
        (order) => !isVoidOrder(order) && getEffectiveStatus(order) !== "done"
      );
    }
    if (activeFilter === "dinein" || activeFilter === "takeaway") {
      return orders.filter(
        (order) =>
          order.type === activeFilter &&
          !isVoidOrder(order) &&
          getEffectiveStatus(order) !== "done"
      );
    }
    if (activeFilter === "done") {
      return orders.filter(
        (order) => !isVoidOrder(order) && getEffectiveStatus(order) === "done"
      );
    }
    if (activeFilter === "void") {
      return orders.filter((order) => isVoidOrder(order));
    }
    return [];
  }, [activeFilter, orders, getEffectiveStatus, isVoidOrder]);

  const getStatusLabel = (order: OrderSummary) => {
    if (isVoidOrder(order)) return "Dibatalkan";
    const status = getEffectiveStatus(order);
    if (status === "queued") return "Queued";
    if (status === "done") return "Selesai";
    return "Proses";
  };

  const { queuedOrders, prosesOrders, doneOrders } = useMemo(() => {
    const queued: OrderSummary[] = [];
    const proses: OrderSummary[] = [];
    const done: OrderSummary[] = [];

    filteredOrders.forEach((order) => {
      const status = getEffectiveStatus(order);
      if (status === "queued") {
        queued.push(order);
      } else if (status === "done") {
        done.push(order);
      } else {
        proses.push(order);
      }
    });

    return { queuedOrders: queued, prosesOrders: proses, doneOrders: done };
  }, [filteredOrders, getEffectiveStatus]);

  const handleOpenDetail = async (order: OrderSummary) => {
    const { order: resolvedOrder, ordersCache } = await resolveKitchenOrderDetail(
      order,
      detailOrders
    );

    if (!resolvedOrder) {
      console.warn(
        "Order detail tidak ditemukan untuk",
        order.transactionId ?? order.id
      );
      return;
    }

    if (!detailOrders && ordersCache) {
      setDetailOrders(ordersCache);
    }
    setSelectedOrder(resolvedOrder);
    setSelectedSummary((prev) => ({
      ...(prev ?? order),
      kitchenNote: order.kitchenNote ?? resolvedOrder.note ?? undefined,
    }));
    setDetailModal(true);
  };

  const handleCloseDetail = () => {
    setDetailModal(false);
    setSelectedOrder(null);
    setSelectedSummary(null);
  };

  const handleUpdateStatus = async (
    order: OrderSummary,
    nextStatus: OrderSummary["kitchenStatus"]
  ) => {
    const key = getStatusKey(order);
    const previousStatus = getEffectiveStatus(order);
    const nextOverrides = { ...statusOverrides, [key]: nextStatus };
    setStatusOverrides((prev) => ({
      ...prev,
      [key]: nextStatus,
    }));
    setOrders((prev) =>
      prev.map((item) =>
        getStatusKey(item) === key
          ? { ...item, kitchenStatus: nextStatus }
          : item
      )
    );
    setSelectedSummary((prev) =>
      prev ? { ...prev, kitchenStatus: nextStatus } : prev
    );

    const result = await updateKitchenStatus({
      order,
      nextStatus,
      orders,
      statusOverrides: nextOverrides,
    });

    if (result.ok) {
      if (result.createdId) {
        setOrders((prev) =>
          prev.map((item) =>
            getStatusKey(item) === key
              ? { ...item, kitchenOrderId: result.createdId }
              : item
          )
        );
        setSelectedSummary((prev) =>
          prev ? { ...prev, kitchenOrderId: result.createdId } : prev
        );
      }
      loadOrders();
      return;
    }

    setStatusOverrides((prev) => ({
      ...prev,
      [key]: previousStatus,
    }));
    setOrders((prev) =>
      prev.map((item) =>
        getStatusKey(item) === key
          ? { ...item, kitchenStatus: previousStatus }
          : item
      )
    );
    setSelectedSummary((prev) =>
      prev ? { ...prev, kitchenStatus: previousStatus } : prev
    );
  };

  const formatTimestamp = (order: OrderSummary) => {
    if (order.timestamp == null) return "-";
    return new Date(order.timestamp).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const getQueueLabel = (order: OrderSummary) => {
    const value = String(order.id ?? "").replace(/\D/g, "");
    const padded = value ? value.padStart(2, "0") : "01";
    return `Antrian - ${padded}`;
  };

  const getHeaderMeta = (order: OrderSummary) => {
    if (order.type === "takeaway") {
      return order.customer ?? "TakeAway";
    }
    return order.table === "-" ? "Meja -" : `Meja ${order.table}`;
  };

  const getAccentColor = (order: OrderSummary) => {
    const status = getEffectiveStatus(order);
    if (status === "done") return "var(--kitchencard_done)";
    return order.type === "dinein"
      ? "var(--kitchencard_dinein)"
      : "var(--kitchencard_takeaway)";
  };

  const getStatusColor = (order: OrderSummary) => {
    if (isVoidOrder(order)) return "#E02929";
    const status = getEffectiveStatus(order);
    if (status === "queued") return "#E02929";
    if (status === "done") return "var(--kitchencard_done)";
    return "var(--primary)";
  };

  const getAccentTextColor = (order: OrderSummary) => {
    const status = getEffectiveStatus(order);
    if (status === "done") return "text-white";
    return order.type === "dinein" ? "text-default" : "text-white";
  };

  const getMinutesFromTimeAgo = (value: string | null | undefined) => {
    if (!value) return 0;
    const lower = value.toLowerCase();
    if (lower.includes("baru")) return 0;
    const numberMatch = lower.match(/\d+/);
    const amount = numberMatch ? Number(numberMatch[0]) : 0;
    if (lower.includes("detik")) return Math.max(amount / 60, 0);
    if (lower.includes("menit")) return Math.max(amount, 0);
    if (lower.includes("jam")) return Math.max(amount * 60, 0);
    if (lower.includes("hari")) return Math.max(amount * 60 * 24, 0);
    return 0;
  };

  const getTimeBarColor = (order: OrderSummary) => {
    if (getEffectiveStatus(order) === "proses") {
      return "color-mix(in srgb, #E02929 3%, white)";
    }
    const minutes = getMinutesFromTimeAgo(order.timeAgo);
    const percent = Math.min(Math.max((minutes / 30) * 100, 0), 100);
    return `color-mix(in srgb, #E02929 ${percent}%, white)`;
  };

  const getTimeBarTextColor = (order: OrderSummary) => {
    if (getEffectiveStatus(order) === "proses") {
      return "text-default";
    }
    const minutes = getMinutesFromTimeAgo(order.timeAgo);
    const percent = Math.min(Math.max((minutes / 30) * 100, 0), 100);
    return percent >= 55 ? "text-white" : "text-default";
  };

  const renderOrderRow = (rowOrders: OrderSummary[], wrap = false) => (
    <div
      className={`gap-[15px] pb-2 ${
        wrap
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
          : "flex flex-nowrap overflow-x-auto hide-scrollbar"
      }`}
    >
      {[...rowOrders]
        .sort(
          (a, b) =>
            getMinutesFromTimeAgo(b.timeAgo) -
            getMinutesFromTimeAgo(a.timeAgo)
        )
        .map((order) => {
        const isWrap = wrap;
        const headerColor = getAccentColor(order);
        const statusColor = getStatusColor(order);
        const detailColor = getAccentColor(order);
        const headerTextColor = getAccentTextColor(order);
        const detailTextColor = getAccentTextColor(order);
        const timeBarColor = getTimeBarColor(order);
        const timeBarTextColor = getTimeBarTextColor(order);
        const items = order.itemsPreview.slice(0, 2);
        const moreCount = Math.max(order.itemsPreview.length - items.length, 0);
        const cardBorder = "var(--tertiary)";

        return (
          <div
            key={getStatusKey(order)}
            className={`cv-auto rounded-xl bg-white shadow-sm overflow-hidden select-none ${
              isWrap ? "w-full" : "shrink-0"
            }`}
            style={{
              width: isWrap ? "100%" : 282,
              maxWidth: isWrap ? 282 : undefined,
              height: 173,
              border: `2px solid ${cardBorder}`,
            }}
          >
            <div className="px-3 py-2" style={{ backgroundColor: headerColor }}>
              <div className={`flex items-center justify-between text-[12px] font-semibold ${headerTextColor}`}>
                <span>{getQueueLabel(order)}</span>
                <span>{getHeaderMeta(order)}</span>
              </div>
              <div className={`flex items-center justify-between text-[10px] ${headerTextColor} opacity-90`}>
                <span>{formatTimestamp(order)}</span>
                <span>{order.type === "dinein" ? "Dine In" : "TakeAway"}</span>
              </div>
            </div>

            <div className="px-2 pb-2">
              <div
                className={`-mx-2 flex items-center justify-between px-3 text-[10px] font-semibold ${timeBarTextColor}`}
                style={{
                  backgroundColor: timeBarColor,
                  height: 27,
                }}
              >
                <span className="flex items-center gap-1">
                  <Clock size={12} className={timeBarTextColor} />
                  {order.timeAgo}
                </span>
                <span>{order.title}</span>
              </div>

              <div className="mt-2 flex gap-3" style={{ height: 107 }}>
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-semibold text-default">{items[0] ? `1. ${items[0]}` : "1. -"}</div>
                  {order.itemSku && <div className="text-[10px] text-gray-500">{order.itemSku}</div>}
                  {order.itemAddons && order.itemAddons.length > 0 && (
                    <div className="text-[10px] text-gray-500">
                      {order.itemAddons.join(", ")}
                    </div>
                  )}
                  {items[1] && <div className="text-xs text-gray-600">+ {items[1]}</div>}
                  {moreCount > 0 && <div className="text-[10px] text-gray-500">+ {moreCount} items lainnya</div>}
                </div>
                <div className="flex w-[76px] flex-col items-end gap-2">
                  <span
                    className="rounded-full text-[10px] font-semibold text-white flex items-center justify-center leading-none"
                    style={{
                      backgroundColor: statusColor,
                      width: 76,
                      height: 23,
                      borderRadius: 12,
                      padding: "4px 21px",
                    }}
                  >
                    {getStatusLabel(order)}
                  </span>
                  <span
                    className={`rounded-full text-[10px] font-semibold flex items-center justify-center leading-none cursor-pointer ${detailTextColor}`}
                    style={{
                      backgroundColor: detailColor,
                      width: 76,
                      height: 23,
                      borderRadius: 12,
                      padding: "4px 21px",
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenDetail(order)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenDetail(order);
                      }
                    }}
                  >
                    Detail
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mb-10">
      <section className="flex items-start justify-between mb-3">
        <div>
          <h1 className="font-semibold text-2xl mb-3">Order Line</h1>

          <div className="flex gap-2 rounded-full flex-wrap">
            {FILTERS.map((filter) => {
              const count =
                filter.id === "all"
                  ? orders.filter(
                      (order) =>
                        !isVoidOrder(order) &&
                        getEffectiveStatus(order) !== "done"
                    ).length
                  : filter.id === "dinein" || filter.id === "takeaway"
                  ? orders.filter(
                      (order) =>
                        order.type === filter.id &&
                        !isVoidOrder(order) &&
                        getEffectiveStatus(order) !== "done"
                    ).length
                  : filter.id === "done"
                  ? orders.filter(
                      (order) =>
                        !isVoidOrder(order) &&
                        getEffectiveStatus(order) === "done"
                    ).length
                  : filter.id === "void"
                  ? orders.filter((order) => isVoidOrder(order)).length
                  : 0;

              const isActive = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center justify-between gap-8 rounded-full px-3 py-1 text-sm border-2 transition cursor-pointer
                    ${isActive ? "border-orange-500 text-orange-500 bg-orange-50" : "border-gray-200 text-gray-400 bg-white"}`}
                >
                  <span>{filter.label}</span>

                  <span
                    className={`rounded-full px-2 text-white text-xs
                      ${isActive ? "bg-orange-500" : "bg-orange-300"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-orange-500 hover:bg-orange-50 transition"
          aria-label="Refresh orders"
          disabled={isLoading}
        >
          <RotateCcw size={18} />
        </button>
      </section>

      <div className="mt-12 space-y-4">
        {activeFilter === "void" ? (
          renderOrderRow(filteredOrders, true)
        ) : activeFilter === "done" ? (
          renderOrderRow(doneOrders, true)
        ) : (
          <>
            {renderOrderRow(queuedOrders)}
            {renderOrderRow(prosesOrders)}
          </>
        )}
      </div>

      <OrderDetailKitchenModal
        open={detailModal}
        onClose={handleCloseDetail}
        order={selectedOrder}
        summary={selectedSummary}
        onUpdateStatus={(nextStatus) => {
          if (selectedSummary) {
            handleUpdateStatus(selectedSummary, nextStatus);
          }
        }}
      />
    </div>
  );
}
