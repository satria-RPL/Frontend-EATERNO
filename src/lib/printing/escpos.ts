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
  logoPath?: string;
  logoMaxWidth?: number;
};

const DEFAULT_WIDTH = 32;
const DEFAULT_LOGO_MAX_WIDTH = 384;

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

export async function buildEscPosPayload(order: Order, options: ReceiptOptions = {}) {
  const width = options.width ?? DEFAULT_WIDTH;
  const storeName = options.storeName ?? "Eaterno";
  const cashierName = options.cashierName ?? "-";
  const divider = "-".repeat(width);
  const logoPath = options.logoPath ?? "/img/brand.png";
  const logoMaxWidth = options.logoMaxWidth ?? DEFAULT_LOGO_MAX_WIDTH;

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
  const itemNotes = detailItems.map((item) => item.note).filter((note): note is string => Boolean(note && note.trim()));
  const displayNote = order.note && order.note.trim() ? order.note.trim() : itemNotes.length > 0 ? itemNotes.join(", ") : null;
  const displayQueue =
    order.queueNumber != null ? String(order.queueNumber) : "-";

  const lines: string[] = [];
  lines.push(centerText(storeName.toUpperCase(), width));
  lines.push(centerText("Struk Pembayaran", width));
  lines.push(divider);
  lines.push(formatLine("No. Struk", order.id, width));
  lines.push(formatLine("Antrian", displayQueue, width));
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

  if (displayNote) {
    lines.push(divider);
    lines.push("Catatan:");
    wrapText(displayNote, width).forEach((line) => lines.push(line));
  }

  lines.push(divider);
  lines.push(formatLine(`Subtotal (${totalItems || order.items} item)`, formatCurrency(subtotalValue), width));
  lines.push(formatLine("PPN", formatCurrency(tax), width));
  lines.push(formatLine("Diskon", formatCurrency(discount), width));
  lines.push(formatLine("Rounding", rounding ? formatCurrency(rounding) : "Rp 0", width));
  lines.push(formatLine("Total", formatCurrency(total), width));
  lines.push("");
  lines.push(centerText("Terima kasih", width));

  const text = `${lines.join("\n")}\n\n\n`;
  const encoder = new TextEncoder();
  const init = Uint8Array.from([0x1b, 0x40]);
  const cut = Uint8Array.from([0x1d, 0x56, 0x00]);
  const alignCenter = Uint8Array.from([0x1b, 0x61, 0x01]);
  const alignLeft = Uint8Array.from([0x1b, 0x61, 0x00]);
  const lineFeed = encoder.encode("\n");
  const chunks: Uint8Array[] = [init];

  const logo = await buildLogoRaster(logoPath, logoMaxWidth);
  if (logo) {
    chunks.push(alignCenter, logo, lineFeed, alignLeft);
  }

  chunks.push(encoder.encode(text), cut);
  return concatChunks(chunks);
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

async function buildLogoRaster(path: string, maxWidth: number): Promise<Uint8Array | null> {
  if (typeof window === "undefined") return null;
  const image = await loadImage(path);
  if (!image) return null;

  const scale = Math.min(1, maxWidth / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const bytesPerRow = Math.ceil(width / 8);
  const raster = new Uint8Array(bytesPerRow * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const a = imageData.data[idx + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const isBlack = a > 128 && lum < 200;
      if (isBlack) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8);
        raster[byteIndex] |= 0x80 >> x % 8;
      }
    }
  }

  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;
  const header = Uint8Array.from([0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH]);
  return concatChunks([header, raster]);
}

async function loadImage(path: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = path;
  });
}
