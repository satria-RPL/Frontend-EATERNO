"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchOrders } from "@/lib/orderService";
import { Order } from "@/types/order";
import Pagination from "@/components/ui/Pagination";
import VoidModal from "@/components/modals/VoidTransaksi";
import { Trash2 } from "lucide-react";

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // === VOID MODAL STATE ===
  const [voidModal, setVoidModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // FETCH DATA
  const loadOrders = async () => {
    const data = await fetchOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // PAGINATION
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return orders.slice(start, start + perPage);
  }, [orders, page]);

  const formatPrice = (num: number) =>
    num.toLocaleString("id-ID", { minimumFractionDigits: 2 });

  // OPEN VOID MODAL
  const handleOpenVoid = (order: Order) => {
    setSelectedOrder(order);
    setVoidModal(true);
  };

  // HANDLE VOID CONFIRM
  const handleConfirmVoid = async (reason: string) => {
    if (!selectedOrder) return;

    await fetch(`/api/orders/${selectedOrder.id}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    await loadOrders();
    setVoidModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="">
      <div className="bg-white">
        <div className="overflow-x-auto rounded-4xl">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F8FA]">
              <tr className="text-[#999] text-center">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">ID Transaction</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>

            <tbody className="text-[#6C6C6C]">
              {paged.map((o, i) => (
                <tr key={o.id} className="justify-center text-center">
                  <td className="px-4">{(page - 1) * perPage + i + 1}</td>
                  <td className="px-4">{o.id}</td>
                  <td className="px-4">{o.name}</td>
                  <td className="px-4">{o.payment}</td>
                  <td className="px-4">{formatPrice(o.price)}</td>
                  <td className="px-4">{o.items}x</td>
                  <td className="px-4">
                    {new Date(o.date).toLocaleDateString("id-ID")}
                  </td>

                  {/* STATUS BUTTON */}
                  <td className="py-4 px-6">
                    {o.status === "proses" && (
                      <button className="flex items-center gap-2 px-2 py-0.5 rounded-full text-sm font-medium bg-red-100 text-[#EB5714] border border-[#EB5714]">
                        <span className="rounded-full border-7 border-red-500"></span>
                        Proses
                      </button>
                    )}

                    {o.status === "cancel" && (
                      <button className="flex items-center gap-2 px-2 py-0.5 rounded-full text-sm font-medium text-red-500 bg-red-100 border border-red-500">
                        <span className="rounded-full border-7 border-red-500"></span>
                        Cancel
                      </button>
                    )}

                    {o.status === "selesai" && (
                      <button className="flex items-center gap-2 px-2 py-0.5 rounded-full text-sm font-medium text-green-600 bg-green-50 border border-green-600">
                        <span className="rounded-full border-7 border-green-600"></span>
                        Done
                      </button>
                    )}
                  </td>

                  {/* DELETE ICON */}
                  <td className="py-4 px-6">
                    {(o.status === "proses" || o.status === "selesai") && (
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-100 transition"
                        title="Void / Delete"
                        onClick={() =>
                          o.status === "proses"
                            ? handleOpenVoid(o) // BUKA MODAL VOID
                            : setOrders(orders.filter((x) => x.id !== o.id)) // DELETE LANGSUNG
                        }
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE FOOTER */}
      <div className="mt-4 flex justify-between text-sm h-[50] items-center">
        <p className="text-[#6C6C6C]">
          Data ditampilkan {Math.min(page * perPage, orders.length)} dari{" "}
          {orders.length}
        </p>

        <Pagination
          page={page}
          setPage={setPage}
          total={orders.length}
          perPage={perPage}
        />
      </div>

      {/* VOID MODAL */}
      <VoidModal
        open={voidModal}
        onClose={() => setVoidModal(false)}
        onConfirm={handleConfirmVoid}
        order={selectedOrder}
      />
    </div>
  );
}
