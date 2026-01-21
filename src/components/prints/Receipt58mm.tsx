"use client";

import type { Order } from "@/types/order";
import type { OrderSummary } from "@/domain/orders/types";
import Image from "next/image";

type Receipt58mmProps = {
  order: Order;
  cashierName?: string;
  storeName?: string;
  summary?: OrderSummary | null;
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

export default function Receipt58mm({ order, cashierName = "-", storeName = "Eaterno", summary }: Receipt58mmProps) {
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
  const displayCustomer = order.customerName ?? (order.tableId ? `Table ${order.tableId}` : "-");
  const displayNote = summary?.kitchenNote ?? "-";
  const displayQueue =
    order.queueNumber != null ? String(order.queueNumber) : "-";

  return (
    <div className="receipt-print text-[10px] text-black font-mono leading-relaxed">
      <div className="text-center mb-2">
        <Image src="img/brand.png" height={100} width={100} alt="Logo" />
        <p className="text-[12px] font-semibold uppercase">{storeName}</p>
        <p className="text-[10px]">Struk Pembayaran</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="space-y-1">
        <div className="flex justify-between gap-2">
          <span>No. Struk</span>
          <span>{order.id}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Antrian</span>
          <span>{displayQueue}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Tanggal</span>
          <span>{displayDate}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Kasir</span>
          <span>{cashierName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Pelanggan</span>
          <span>{displayCustomer}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Tipe</span>
          <span>{displayOrderType}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Payment</span>
          <span>{order.payment || "-"}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {detailItems.length === 0 ? (
        <p className="text-[10px]">Detail item belum tersedia.</p>
      ) : (
        <>
          <div className="space-y-2">
            {detailItems.map((item, index) => {
              const linePrice = item.qty * item.price;
              return (
                <div key={`${item.name}-${index}`} className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span>
                      {item.qty}x {item.name}
                    </span>
                    <span>{formatCurrency(linePrice)}</span>
                  </div>
                  {item.options?.map((option, optIndex) => (
                    <div key={`${option.label}-${optIndex}`} className="flex items-start justify-between gap-2 text-[9px]">
                      <span>+ {option.label}</span>
                      {typeof option.price === "number" ? <span>{formatCurrency(option.price)}</span> : null}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
      
      <div className="mt-4 border-t border-[#e6e1dc] pt-4 text-sm">
        <div className="font-semibold text-[#1c1c1c]">Catatan User :</div>
        <div className="mt-2 text-[#7c7c7c]">{displayNote}</div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="space-y-1">
        <div className="flex justify-between gap-2">
          <span>Subtotal ({totalItems || order.items} item)</span>
          <span>{formatCurrency(subtotalValue)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>PPN</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Diskon</span>
          <span>{formatCurrency(discount)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span>Rounding</span>
          <span>{rounding ? formatCurrency(rounding) : "Rp 0"}</span>
        </div>
        <div className="flex justify-between gap-2 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mt-3 text-center text-[9px]">
        <p>Terima kasih</p>
      </div>

      <style jsx global>{`
        .receipt-print {
          position: fixed;
          left: -10000px;
          top: 0;
          width: 58mm;
        }

        @media print {
          @page {
            size: 58mm auto;
            margin: 4mm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .receipt-print,
          .receipt-print * {
            visibility: visible;
          }

          .receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 58mm;
          }
        }
      `}</style>
    </div>
  );
}
