"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { createOrderHistoryActions } from "@/domain/orders/orderHistory";
import {
  fetchOrders,
  voidOrder,
  updateTransactionStatus,
  fetchTransactionById,
} from "@/lib/services/orderService";
import { usePolling } from "@/lib/hooks/usePolling";
import {
  buildEscPosPayload,
  getSerialApi,
  openSerialPort,
  writeSerial,
  type SerialPortLike,
} from "@/lib/printing/escpos";
import { Order } from "@/types/order";
import Pagination from "@/components/ui/Pagination";
import VoidModal from "@/components/modals/VoidTransaksi";
import OrderDetailModal from "@/components/modals/OrderDetailModal";

type OrderTableProps = {
  authName?: string;
  authRole?: string;
  activeFilter: "all" | "proses" | "ready_to_pickup" | "selesai" | "cancel";
  activeSort: "newest" | "oldest";
};

export default function OrderTable({
  authName,
  authRole,
  activeFilter,
  activeSort,
}: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") ?? "";

  const [voidModal, setVoidModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [voidError, setVoidError] = useState<string | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);
  const [printerPort, setPrinterPort] = useState<SerialPortLike | null>(null);
  const [printerConnecting, setPrinterConnecting] = useState(false);
  const [baudRate, setBaudRate] = useState(9600);

  const { loadOrders, voidTransaction } = useMemo(
    () => createOrderHistoryActions({ fetchOrders, voidOrder }),
    []
  );

  const ordersFingerprintRef = useRef<string>("");
  const applyOrders = useCallback((nextOrders: Order[]) => {
    const fingerprint = nextOrders
      .map(
        (order) =>
          `${order.id}:${order.status}:${order.date}:${order.items}:${order.price}`
      )
      .join("|");
    if (fingerprint === ordersFingerprintRef.current) return;
    ordersFingerprintRef.current = fingerprint;
    setOrders(nextOrders);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const data = await loadOrders();
      applyOrders(data);
    } catch {
      applyOrders([]);
    }
  }, [applyOrders, loadOrders]);

  usePolling(fetchData, { intervalMs: 15000, immediate: true });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("eaterno-printer-baud");
    if (!stored) return;
    const parsed = Number(stored);
    if (Number.isFinite(parsed)) setBaudRate(parsed);
  }, []);

  useEffect(() => {
    const port = printerPort;
    return () => {
      if (!port) return;
      port.close().catch(() => {});
    };
  }, [printerPort]);

  const searched = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return orders;
    return orders.filter((order) => {
      const text = [
        order.id,
        order.name,
        order.payment,
        order.status,
        order.date,
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(normalized);
    });
  }, [orders, searchTerm]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return searched;
    return searched.filter((order) => order.status === activeFilter);
  }, [searched, activeFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return activeSort === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [filtered, activeSort]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter, activeSort, perPage]);

  const formatPrice = (num: number) =>
    num.toLocaleString("id-ID", { minimumFractionDigits: 2 });

  const handleOpenVoid = (order: Order) => {
    setSelectedOrder(order);
    setVoidError(null);
    setVoidModal(true);
  };

  const handleOpenDetail = async (order: Order) => {
    setSelectedOrder(order);
    setDetailModal(true);
    setStatusError(null);
    setPrintError(null);

    if (!order.transactionId) return;
    if (order.note && order.note.trim()) return;

    const result = await fetchTransactionById(order.transactionId);
    if (result.ok) {
      const updated = result.data;
      setSelectedOrder((prev) =>
        prev && prev.id === updated.id
          ? { ...updated, queueNumber: prev.queueNumber ?? null }
          : prev
      );
    }
  };

  const handleConfirmVoid = async (reason: string, pin: string) => {
    if (!selectedOrder) return;

    setVoidError(null);
    const resolvedId = selectedOrder.transactionId ?? selectedOrder.id;

    if (resolvedId == null || resolvedId === "") {
      setVoidError("ID transaksi tidak ditemukan.");
      return;
    }

    try {
      await voidTransaction(resolvedId, reason, pin);
      const updated = await loadOrders();
      setOrders(updated);
      setVoidModal(false);
      setSelectedOrder(null);
    } catch (error) {
      setVoidError(
        error instanceof Error ? error.message : "Gagal void transaksi."
      );
    }
  };

  const handleMarkPickedUp = async (order: Order) => {
    if (statusUpdating) return;
    if (!order.transactionId) {
      setStatusError("ID transaksi tidak ditemukan.");
      return;
    }
    setStatusUpdating(true);
    setStatusError(null);

    const result = await updateTransactionStatus(
      order.transactionId,
      "paid"
    );

    if (!result.ok) {
      setStatusError(result.error || "Gagal update status transaksi.");
      setStatusUpdating(false);
      return;
    }

    const updated = await loadOrders();
    setOrders(updated);
    const refreshed = updated.find((item) => item.id === order.id);
    setSelectedOrder(refreshed ?? order);
    setStatusUpdating(false);
  };

  const handlePrintReceipt = async (order: Order) => {
    setPrintError(null);
    if (printerConnecting) return;
    const serialApi = getSerialApi();
    if (!serialApi) {
      setPrintError("Browser ini tidak mendukung Web Serial.");
      return;
    }

    setPrinterConnecting(true);
    try {
      const port = printerPort ?? (await serialApi.requestPort());
      await openSerialPort(port, baudRate);
      const payload = await buildEscPosPayload(order, {
        storeName: "Eaterno",
        cashierName: authName || undefined,
      });
      await writeSerial(port, payload);
      setPrinterPort(port);
    } catch {
      setPrintError("Gagal mencetak struk.");
    } finally {
      setPrinterConnecting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#e9e4df] bg-white p-4 shadow-sm">
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto hide-scrollbar rounded-2xl border border-[#e9e4df]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#e9e4df] bg-[#f8f6f4] text-left text-xs text-[#8c8c8c]">
              <th className="py-3 px-4 text-center">#</th>
              <th className="py-3 px-4">ID Transaksi</th>
              <th className="py-3 px-4">Nama Pelanggan</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4 text-center">Items</th>
              <th className="py-3 px-4">Date Time</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="text-[#6f6f6f]">
            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-6 text-center text-sm text-[#9a9a9a]"
                >
                  Data tidak ditemukan.
                </td>
              </tr>
            )}
            {paged.map((order, index) => {
              const canVoid = order.status === "proses";
              return (
                <tr
                  key={order.id}
                  className="border-b border-[#f2e8e0] even:bg-[#fdeee6]"
                >
                <td className="px-4 py-3 text-center">
                  {(page - 1) * perPage + index + 1}
                </td>
                <td className="px-4 py-3">{order.id}</td>
                <td className="px-4 py-3 text-[#3f2f23]">
                  {order.name}
                </td>
                <td className="px-4 py-3">{order.payment}</td>
                <td className="px-4 py-3 text-[#3f2f23]">
                  {formatPrice(order.price)}
                </td>
                <td className="px-4 py-3 text-center">{order.items}x</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(order.date).toLocaleDateString("id-ID")}
                </td>

                <td className="px-4 py-3 text-center">
                  {order.status === "proses" && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#f97316] bg-white px-3 py-0.5 text-xs font-semibold text-[#f97316]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]"></span>
                      Proses
                    </span>
                  )}

                  {order.status === "ready_to_pickup" && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#0ea5e9] bg-white px-3 py-0.5 text-xs font-semibold text-[#0ea5e9]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#0ea5e9]"></span>
                      Ready to Pickup
                    </span>
                  )}

                  {order.status === "cancel" && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#ef4444] bg-white px-3 py-0.5 text-xs font-semibold text-[#ef4444]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]"></span>
                      Cancel
                    </span>
                  )}

                  {order.status === "selesai" && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#16a34a] bg-white px-3 py-0.5 text-xs font-semibold text-[#16a34a]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]"></span>
                      Done
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#ef4444] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Delete"
                      type="button"
                      disabled={!canVoid}
                      onClick={() => {
                        if (canVoid) {
                          handleOpenVoid(order);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#22c55e] text-white transition hover:opacity-90"
                      title="View"
                      type="button"
                      onClick={() => void handleOpenDetail(order)}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-[#6f6f6f]">
          Data ditampilkan {Math.min(page * perPage, filtered.length)} dari{" "}
          {filtered.length}
        </p>

        <Pagination
          page={page}
          setPage={setPage}
          total={filtered.length}
          perPage={perPage}
          setPerPage={setPerPage}
        />
      </div>

      <VoidModal
        open={voidModal}
        onClose={() => setVoidModal(false)}
        onConfirm={handleConfirmVoid}
        order={selectedOrder}
        authName={authName}
        authRole={authRole}
        errorMessage={voidError}
      />

      <OrderDetailModal
        open={detailModal}
        onClose={() => setDetailModal(false)}
        order={selectedOrder}
        cashierName={authName}
        onMarkPickedUp={
          !statusUpdating ? handleMarkPickedUp : undefined
        }
        onPrintReceipt={
          !printerConnecting ? handlePrintReceipt : undefined
        }
        statusError={statusError}
        printError={printError}
      />
    </div>
  );
}
