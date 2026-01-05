"use client";

import { Order } from "@/types/order";

type OrderDetailModalProps = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  cashierName?: string;
};

function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

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

export default function OrderDetailModal({
  open,
  onClose,
  order,
  cashierName,
}: OrderDetailModalProps) {
  if (!open || !order) return null;

  const detailItems = order.detailItems ?? [];
  const totalItems = detailItems.reduce((sum, item) => sum + item.qty, 0);
  const total = order.price ?? 0;
  const tax = order.tax ?? 0;
  const discount = order.discount ?? 0;
  const subtotal = detailItems.reduce((sum, item) => {
    const optionsTotal =
      item.options?.reduce((optSum, option) => {
        return optSum + (option.price ?? 0);
      }, 0) ?? 0;
    return sum + item.qty * (item.price + optionsTotal);
  }, 0);
  const subtotalValue = subtotal > 0 ? subtotal : total;
  const totalWithoutRounding = subtotalValue + tax - discount;
  const rounding = subtotal > 0 ? total - totalWithoutRounding : 0;
  const displayDate = formatDateTime(order.createdAt ?? order.date);
  const displayOrderType = formatOrderType(order.orderType);
  const displayCustomer = order.customerName ?? "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-[760px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e6e1dc] pb-4">
          <h2 className="text-2xl font-semibold text-[#1c1c1c]">
            Detail Order {order.id}
          </h2>
          <button
            className="text-3xl font-semibold text-red-500"
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
            <div className="space-y-4">
              {detailItems.map((item, index) => {
                const linePrice = item.qty * item.price;
                return (
                  <div key={`${item.name}-${index}`} className="space-y-1">
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span>{formatCurrency(linePrice)}</span>
                    </div>
                    {item.options?.map((option, optIndex) => (
                      <div
                        key={`${option.label}-${optIndex}`}
                        className="flex items-center justify-between text-sm text-[#7c7c7c]"
                      >
                        <span>+ {option.label}</span>
                        {typeof option.price === "number" ? (
                          <span>{formatCurrency(option.price)}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-[#e6e1dc] pt-4">
          <div className="space-y-2 text-base">
            <div className="flex items-center justify-between">
              <span>Subtotal ( {totalItems || order.items} Items )</span>
              <span className="text-[#ff6a00]">
                {formatCurrency(subtotalValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fee / PPN 11%</span>
              <span className="text-[#ff6a00]">
                {formatCurrency(tax)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rounding</span>
              <span className="text-[#ff6a00]">
                {rounding ? formatCurrency(rounding) : "Rp 0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment Method</span>
              <span className="text-[#ff6a00]">{order.payment}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-[#ff6a00]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
