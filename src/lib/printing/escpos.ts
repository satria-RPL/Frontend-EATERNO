"use client";

import type { Order } from "@/types/order";

export type SerialPortLike = {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
};

type NavigatorSerial = {
  requestPort: () => Promise<SerialPortLike>;
  getPorts: () => Promise<SerialPortLike[]>;
};

type ReceiptOptions = {
  storeName?: string;
  cashierName?: string;
  width?: number;
};

const DEFAULT_WIDTH = 32;

export function getSerialApi(): NavigatorSerial | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { serial?: NavigatorSerial };
  return nav.serial ?? null;
}

export async function openSerialPort(port: SerialPortLike, baudRate: number) {
  if (port.readable || port.writable) return;
  await port.open({ baudRate });
}

export async function writeSerial(port: SerialPortLike, data: Uint8Array) {
  if (!port.writable) {
    throw new Error("Port belum terbuka");
  }
  const writer = port.writable.getWriter();
  try {
    await writer.write(data);
  } finally {
    writer.releaseLock();
  }
}

export function buildEscPosPayload(
  order: Order,
  options: ReceiptOptions = {}
) {
  const width = options.width ?? DEFAULT_WIDTH;
  const storeName = options.storeName ?? "Eaterno";
  const cashierName = options.cashierName ?? "-";
  const divider = "-".repeat(width);

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
  const displayCustomer =
    order.customerName ?? (order.tableId ? `Table ${order.tableId}` : "-");

  const lines: string[] = [];
  lines.push(centerText(storeName.toUpperCase(), width));
  lines.push(centerText("Struk Pembayaran", width));
  lines.push(divider);
  lines.push(formatLine("No. Struk", order.id, width));
  lines.push(formatLine("Tanggal", displayDate, width));
  lines.push(formatLine("Kasir", cashierName, width));
  lines.push(formatLine("Pelanggan", displayCustomer, width));
  lines.push(formatLine("Tipe", displayOrderType, width));
  lines.push(formatLine("Payment", order.payment || "-", width));
  lines.push(divider);

  if (detailItems.length === 0) {
    lines.push("Detail item belum tersedia.");
  } else {
    detailItems.forEach((item) => {
      const linePrice = formatCurrency(item.qty * item.price);
      const label = `${item.qty}x ${item.name}`;
      const wrapped = wrapText(label, width - linePrice.length - 1);
      if (wrapped.length === 0) {
        lines.push(formatLine(label, linePrice, width));
      } else if (wrapped.length === 1) {
        lines.push(formatLine(wrapped[0], linePrice, width));
      } else {
        lines.push(formatLine(wrapped[0], linePrice, width));
        wrapped.slice(1).forEach((part) => lines.push(part));
      }

      item.options?.forEach((option) => {
        const optionLabel = `+ ${option.label}`;
        if (typeof option.price === "number") {
          const optionPrice = formatCurrency(option.price);
          lines.push(formatLine(optionLabel, optionPrice, width));
        } else {
          lines.push(optionLabel);
        }
      });
    });
  }

  lines.push(divider);
  lines.push(
    formatLine(
      `Subtotal (${totalItems || order.items} item)`,
      formatCurrency(subtotalValue),
      width
    )
  );
  lines.push(formatLine("PPN", formatCurrency(tax), width));
  lines.push(formatLine("Diskon", formatCurrency(discount), width));
  lines.push(
    formatLine(
      "Rounding",
      rounding ? formatCurrency(rounding) : "Rp 0",
      width
    )
  );
  lines.push(formatLine("Total", formatCurrency(total), width));
  lines.push("");
  lines.push(centerText("Terima kasih", width));

  const text = `${lines.join("\n")}\n\n\n`;
  const encoder = new TextEncoder();
  const init = Uint8Array.from([0x1b, 0x40]);
  const cut = Uint8Array.from([0x1d, 0x56, 0x00]);
  return concatChunks([init, encoder.encode(text), cut]);
}

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

function wrapText(text: string, width: number) {
  if (width <= 0) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (current.length + 1 + word.length <= width) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length === 0 && text) lines.push(text.slice(0, width));
  return lines;
}

function formatLine(left: string, right: string, width: number) {
  const available = width - left.length - right.length;
  if (available <= 1) {
    return `${left}\n${padLeft(right, width)}`;
  }
  return `${left}${" ".repeat(available)}${right}`;
}

function centerText(text: string, width: number) {
  if (text.length >= width) return text;
  const pad = Math.floor((width - text.length) / 2);
  return `${" ".repeat(pad)}${text}`;
}

function padLeft(text: string, width: number) {
  if (text.length >= width) return text;
  return `${" ".repeat(width - text.length)}${text}`;
}

function concatChunks(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });
  return merged;
}
