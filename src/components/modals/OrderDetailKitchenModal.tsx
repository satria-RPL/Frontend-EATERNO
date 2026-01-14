"use client";

import type { Order } from "@/types/order";
import type { OrderSummary } from "@/domain/orders/types";

type KitchenStatus = "queued" | "proses" | "done";

type OrderDetailKitchenModalProps = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  summary: OrderSummary | null;
  cashierName?: string;
  onUpdateStatus?: (nextStatus: KitchenStatus) => void;
};

function formatOrderType(value: string | null | undefined) {
  if (!value) return "-";
  const normalized = value.replace(/_/g, " ").toLowerCase();
  return normalized.replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  const formatted = new Date(parsed).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatted.replace(/\//g, "-");
}

export default function OrderDetailKitchenModal({
  open,
  onClose,
  order,
  summary,
  cashierName,
  onUpdateStatus,
}: OrderDetailKitchenModalProps) {
  if (!open || !order || !summary) return null;

  const detailItems = order.detailItems ?? [];
  const totalItems = detailItems.reduce((sum, item) => sum + item.qty, 0);
  const displayDate = formatDateTime(order.createdAt ?? order.date);
  const displayOrderType = formatOrderType(order.orderType);
  const displayCustomer = order.customerName ?? "-";
  const displayNote = summary.kitchenNote ?? "-";
  const displayOrderId = order.id || "-";

  const currentStatus = summary.kitchenStatus ?? "queued";
  const actionLabel =
    currentStatus === "queued"
      ? "Proses"
      : currentStatus === "proses"
      ? "Selesaikan Pesanan"
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e6e1dc] pb-4">
          <h2 className="text-lg font-semibold text-[#1c1c1c]">
            Detail Order {displayOrderId}
          </h2>
          <button
            className="text-2xl font-semibold text-red-500"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-[#1c1c1c]">
          <div className="flex items-center justify-between">
            <span>Kasir</span>
            <span className="text-[#ff6a00]">{cashierName || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Nama Pelanggan</span>
            <span className="text-[#ff6a00]">{displayCustomer}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tipe Pesanan</span>
            <span className="text-[#ff6a00]">{displayOrderType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tanggal Jam Transaksi</span>
            <span className="text-[#ff6a00]">{displayDate}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-[#e6e1dc] pt-4">
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total Items</span>
            <span>{totalItems || order.items} Items</span>
          </div>

          {detailItems.length === 0 ? (
            <p className="text-sm text-[#8c8c8c]">
              Detail item belum tersedia.
            </p>
          ) : (
            <div className="mt-3 space-y-4">
              {detailItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="space-y-1">
                  <div className="text-sm font-semibold">
                    {item.qty}x {item.name}
                  </div>
                  {item.options?.map((option, optIndex) => (
                    <div
                      key={`${option.label}-${optIndex}`}
                      className="text-xs text-[#7c7c7c]"
                    >
                      + {option.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-[#e6e1dc] pt-4 text-sm">
          <div className="font-semibold text-[#1c1c1c]">Catatan User :</div>
          <div className="mt-2 text-[#7c7c7c]">{displayNote}</div>
        </div>

        {actionLabel ? (
          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-[#f97316] py-2 text-sm font-semibold text-white"
            onClick={() =>
              onUpdateStatus?.(
                currentStatus === "queued" ? "proses" : "done"
              )
            }
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
