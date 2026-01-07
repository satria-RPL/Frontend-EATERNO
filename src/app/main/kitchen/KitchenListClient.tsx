"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, RotateCcw } from "lucide-react";
import { fetchOrders } from "@/lib/services/orderService";
import type { Order } from "@/types/order";
import OrderDetailModal from "@/components/modals/OrderDetailModal";

import type { OrderSummary } from "@/data/orders";
import { createKitchenOrdersLoader } from "@/domain/kitchenOrders";
import { fetchKitchenOrders } from "@/lib/services/kitchenOrderService";

type KitchenFilter = "all" | "dinein" | "takeaway" | "done" | "void";

const FILTERS: Array<{ id: KitchenFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "dinein", label: "Dine In" },
  { id: "takeaway", label: "TakeAway" },
  { id: "done", label: "Selesai" },
  { id: "void", label: "Void / Dibatalkan" },
];

export default function KitchenListClient() {
  const [activeFilter, setActiveFilter] = useState<KitchenFilter>("all");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailOrders, setDetailOrders] = useState<Order[] | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { loadKitchenOrders } = useMemo(() => createKitchenOrdersLoader({ fetchKitchenOrders }), []);

  const loadOrders = async () => {
    setIsLoading(true);
    const result = await loadKitchenOrders();
    if (result.error) {
      console.error("Failed to load kitchen orders", result.error);
      setOrders([]);
      setIsLoading(false);
      return;
    }
    setOrders(result.orders);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    if (activeFilter === "dinein" || activeFilter === "takeaway") {
      return orders.filter((order) => order.type === activeFilter);
    }
    return [];
  }, [activeFilter, orders]);

  const getStatusLabel = () => "Queued";

  const { queuedOrders, prosesOrders } = useMemo(() => {
    const queued: OrderSummary[] = [];
    const proses: OrderSummary[] = [];

    filteredOrders.forEach((order) => {
      if (getStatusLabel(order) === "Queued") {
        queued.push(order);
      } else {
        proses.push(order);
      }
    });

    return { queuedOrders: queued, prosesOrders: proses };
  }, [filteredOrders]);

  const handleOpenDetail = async (order: OrderSummary) => {
    let ordersData = detailOrders;
    if (!ordersData) {
      ordersData = await fetchOrders();
      setDetailOrders(ordersData);
    }

    const orderId = String(order.id);
    const matched =
      ordersData?.find(
        (item) => item.id.replace(/\D/g, "") === orderId
      ) ?? null;

    if (!matched) {
      console.warn("Order detail tidak ditemukan untuk", orderId);
      return;
    }

    setSelectedOrder(matched);
    setDetailModal(true);
  };

  const handleCloseDetail = () => {
    setDetailModal(false);
    setSelectedOrder(null);
  };

  const formatTimestamp = () =>
    new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

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

  const getHeaderColor = (order: OrderSummary) => (order.type === "dinein" ? "var(--kichencard_dinein1)" : "var(--kichencard_takeaway)");

  const getStatusColor = (order: OrderSummary) => (order.type === "dinein" ? "var(--kichencard_dinein2)" : "var(--kichencard_takeaway2)");

  const getDetailColor = (order: OrderSummary) => (order.type === "dinein" ? "var(--kichencard_dinein1)" : "var(--kichencard_takeaway)");

  const getHeaderTextColor = (order: OrderSummary) => (order.type === "dinein" ? "text-white" : "text-default");

  const getDetailTextColor = (order: OrderSummary) => (order.type === "dinein" ? "text-white" : "text-default");

  return (
    <div className="mb-10">
      <section className="flex items-start justify-between mb-3">
        <div>
          <h1 className="font-semibold text-2xl mb-3">Order Line</h1>

          <div className="flex gap-2 rounded-full flex-wrap">
            {FILTERS.map((filter) => {
              const count = filter.id === "all" ? orders.length : filter.id === "dinein" || filter.id === "takeaway" ? orders.filter((order) => order.type === filter.id).length : 0;

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
        <div className="flex flex-nowrap gap-[15px] overflow-x-auto pb-2 hide-scrollbar">
          {queuedOrders.map((order) => {
          const headerColor = getHeaderColor(order);
          const statusColor = getStatusColor(order);
          const detailColor = getDetailColor(order);
          const headerTextColor = getHeaderTextColor(order);
          const detailTextColor = getDetailTextColor(order);
          const items = order.itemsPreview.slice(0, 2);
          const moreCount = Math.max(order.itemsPreview.length - items.length, 0);
          const cardBorder = "var(--tertiary)";

          return (
            <div
              key={order.id}
              className="shrink-0 rounded-xl bg-white shadow-sm overflow-hidden"
              style={{ width: 282, height: 173, border: `2px solid ${cardBorder}` }}
            >
              <div className="px-3 py-2" style={{ backgroundColor: headerColor }}>
                <div className={`flex items-center justify-between text-[12px] font-semibold ${headerTextColor}`}>
                  <span>{getQueueLabel(order)}</span>
                  <span>{getHeaderMeta(order)}</span>
                </div>
                <div className={`flex items-center justify-between text-[10px] ${headerTextColor} opacity-90`}>
                  <span>{formatTimestamp()}</span>
                  <span>{order.type === "dinein" ? "Dine In" : "TakeAway"}</span>
                </div>
              </div>

              <div className="px-2 pb-2">
                <div
                  className="-mx-2 flex items-center justify-between px-3 text-[10px] font-semibold text-white"
                  style={{
                    backgroundColor: statusColor,
                    height: 27,
                  }}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-white" />
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
                      className={`rounded-full text-[10px] font-semibold flex items-center justify-center leading-none ${detailTextColor}`}
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

        <div className="flex flex-nowrap gap-[15px] overflow-x-auto pb-2 hide-scrollbar">
          {prosesOrders.map((order) => {
            const headerColor = getHeaderColor(order);
            const statusColor = getStatusColor(order);
            const detailColor = getDetailColor(order);
            const headerTextColor = getHeaderTextColor(order);
            const detailTextColor = getDetailTextColor(order);
            const items = order.itemsPreview.slice(0, 2);
            const moreCount = Math.max(order.itemsPreview.length - items.length, 0);
            const cardBorder = "var(--tertiary)";

            return (
              <div
                key={order.id}
                className="shrink-0 rounded-xl bg-white shadow-sm overflow-hidden"
                style={{ width: 282, height: 173, border: `2px solid ${cardBorder}` }}
              >
                <div className="px-3 py-2" style={{ backgroundColor: headerColor }}>
                  <div className={`flex items-center justify-between text-[12px] font-semibold ${headerTextColor}`}>
                    <span>{getQueueLabel(order)}</span>
                    <span>{getHeaderMeta(order)}</span>
                  </div>
                  <div className={`flex items-center justify-between text-[10px] ${headerTextColor} opacity-90`}>
                    <span>{formatTimestamp()}</span>
                    <span>{order.type === "dinein" ? "Dine In" : "TakeAway"}</span>
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <div
                    className="-mx-2 flex items-center justify-between px-3 text-[10px] font-semibold text-white"
                    style={{
                      backgroundColor: statusColor,
                      height: 27,
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-white" />
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
                        className={`rounded-full text-[10px] font-semibold flex items-center justify-center leading-none ${detailTextColor}`}
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
      </div>

      <OrderDetailModal
        open={detailModal}
        onClose={handleCloseDetail}
        order={selectedOrder}
      />
    </div>
  );
}
