import type { CartItemInput } from "@/domain/checkout/transactions";
import { buildTransactionItems, resolveOrderType } from "@/domain/checkout/transactions";
import { createOrderPrintResolver } from "@/domain/orders/orderPrint";
import { clearCheckoutState, readCheckoutState } from "@/lib/checkout/storage";
import { buildEscPosPayload, openSerialPort, writeSerial, type SerialPortLike } from "@/lib/printing/escpos";
import { createKitchenOrderStatus } from "@/lib/services/kitchenOrderService";
import { fetchOrders } from "@/lib/services/orderService";
import { TablesService } from "@/lib/services/tablesService";
import { createTransaction, fetchTransactionItems, updateTransaction } from "@/lib/services/transactionService";

export type { SerialPortLike };

type TotalsSnapshot = {
  total: number;
  tax: number;
  discount: number;
};

type ProcessPaymentInput = {
  cart: CartItemInput[];
  itemsCount: number;
  totals: TotalsSnapshot;
  tableId: number | null;
  placeId: number | null;
  customerName: string | null;
  orderTypeParam: string | null;
  paymentMethodId: number;
  cashierName?: string;
  printerPort: SerialPortLike | null;
  baudRate: number;
};

type ProcessPaymentResult = {
  ok: boolean;
  submitError?: string;
  printError?: string;
  shouldNavigate: boolean;
  didCreateTransaction: boolean;
};

const { resolveOrderForPrint } = createOrderPrintResolver({ fetchOrders });

export async function processPayment({
  cart,
  itemsCount,
  totals,
  tableId,
  placeId,
  customerName,
  orderTypeParam,
  paymentMethodId,
  cashierName,
  printerPort,
  baudRate,
}: ProcessPaymentInput): Promise<ProcessPaymentResult> {
  const savedState = readCheckoutState();
  const storedPlaceId = resolveStoredPlaceId();
  const resolvedTableId = Number.isFinite(tableId)
    ? tableId
    : Number.isFinite(savedState.tableId)
    ? savedState.tableId ?? null
    : null;
  const resolvedPlaceId = Number.isFinite(placeId) ? placeId : storedPlaceId;
  const resolvedCustomerName = customerName ?? savedState.customerName ?? null;
  const resolvedOrderType = resolveOrderType(
    orderTypeParam ?? savedState.orderType ?? null,
    resolvedTableId
  );
  const finalTableId =
    resolvedOrderType === "takeaway" ? null : resolvedTableId;

  const result = await createTransaction({
    placeId: resolvedPlaceId,
    tableId: finalTableId,
    orderType: resolvedOrderType,
    customerName: resolvedCustomerName,
    note: savedState.kitchenNote?.trim() || null,
    totalItems: itemsCount,
    total: totals.total,
    tax: totals.tax,
    discount: totals.discount,
    paymentMethodId,
    items: buildTransactionItems(cart, savedState.kitchenNote?.trim() || null),
  });

  if (!result.ok) {
    return {
      ok: false,
      submitError: result.error || "Gagal memproses transaksi",
      shouldNavigate: false,
      didCreateTransaction: false,
    };
  }

  const transactionCode = persistTransactionCode(result.data);
  const transactionId = resolveTransactionId(result.data);
  const kitchenNote = savedState.kitchenNote?.trim() || null;

  if (transactionId && kitchenNote) {
    updateTransaction(transactionId, {
      note: kitchenNote,
      kitchenNote,
    }).catch((error) => {
      console.warn("Gagal update catatan transaksi", error);
    });
  }

  if (transactionId) {
    createKitchenOrdersForTransaction(transactionId, kitchenNote).catch(
      (error) => {
        console.warn("Gagal membuat kitchen order", error);
      }
    );
  }

  if (resolvedOrderType === "dine_in" && finalTableId) {
    markTableOccupied(finalTableId).catch((error) => {
      console.warn("Gagal update status meja", error);
    });
  }

  clearCheckoutState();

  if (!printerPort) {
    return {
      ok: true,
      shouldNavigate: true,
      didCreateTransaction: true,
    };
  }

  const orderForPrint = await resolveOrderForPrint(transactionCode);
  if (!orderForPrint) {
    return {
      ok: true,
      printError: "Struk belum siap dicetak. Coba cetak ulang dari History Order.",
      shouldNavigate: false,
      didCreateTransaction: true,
    };
  }

  try {
    await openSerialPort(printerPort, baudRate);
    const payload = await buildEscPosPayload(orderForPrint, {
      storeName: "Eaterno",
      cashierName: cashierName || undefined,
    });
    await writeSerial(printerPort, payload);
    return {
      ok: true,
      shouldNavigate: true,
      didCreateTransaction: true,
    };
  } catch {
    return {
      ok: true,
      printError: "Gagal mencetak struk. Coba ulang dari History Order.",
      shouldNavigate: false,
      didCreateTransaction: true,
    };
  }
}

async function markTableOccupied(tableId: number) {
  const tables = await TablesService.getAll();
  const table = tables.find((item) => Number(item.id) === tableId);
  if (!table) return;
  await TablesService.update(tableId, {
    placeId: table.placeId,
    name: table.name,
    capacity: table.capacity,
    status: "not_available",
  });
}

function persistTransactionCode(payload: unknown) {
  if (!payload || typeof window === "undefined") return null;
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  const transaction =
    record && typeof record.data === "object" && record.data != null
      ? (record.data as Record<string, unknown>)
      : record;
  const rawCode =
    transaction?.code ??
    transaction?.orderNumber ??
    transaction?.order_no ??
    transaction?.invoiceNumber ??
    transaction?.invoice_no ??
    transaction?.receiptNumber ??
    transaction?.receipt_no ??
    transaction?.id;
  if (!rawCode) return null;
  const code = String(rawCode).replace(/^#/, "");
  if (!code) return null;
  window.localStorage.setItem("lastTransactionCode", code);
  return code;
}

type TransactionItemRecord = {
  id?: number | null;
  transactionItemId?: number | null;
  transaction_item_id?: number | null;
  transactionId?: number | null;
  transaction_id?: number | null;
  note?: string | null;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function resolveTransactionId(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const data =
    typeof record.data === "object" && record.data != null
      ? (record.data as Record<string, unknown>)
      : record;
  return toNumber(data.id ?? data.transactionId ?? data.transaction_id ?? null);
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];
  return [];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createKitchenOrdersForTransaction(
  transactionId: number,
  fallbackNote: string | null
) {
  const attempts = 12;
  const baseDelay = 500;
  const maxDelay = 2000;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const itemsResult = await fetchTransactionItems();
    if (itemsResult.ok) {
      const items = unwrapArray<TransactionItemRecord>(itemsResult.data);
      const matched = items.filter(
        (item) =>
          toNumber(item.transactionId ?? item.transaction_id) === transactionId
      );

      if (matched.length > 0) {
        await Promise.all(
          matched.map(async (item) => {
            const itemId = toNumber(
              item.transactionItemId ?? item.transaction_item_id ?? item.id
            );
            if (!itemId) return;
            const note =
              typeof item.note === "string" && item.note.trim()
                ? item.note.trim()
                : fallbackNote;
            await createKitchenOrderStatus({
              transactionItemId: itemId,
              status: "queued",
              note: note ?? null,
            });
          })
        );
        return;
      }
    }

    if (attempt < attempts - 1) {
      const delay = Math.min(maxDelay, baseDelay * 2 ** attempt);
      await sleep(delay);
    }
  }
}

function resolveStoredPlaceId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("eaterno-place-id");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
