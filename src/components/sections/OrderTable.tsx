"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchOrders } from "@/lib/orderService";
import { Order } from "@/types/order";
import Pagination from "@/components/ui/Pagination";
import VoidModal from "@/components/ui/VoidModal";
import { Trash2 } from "lucide-react";

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [selectedForVoid, setSelectedForVoid] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders().then(setOrders);
  }, []);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return orders.slice(start, start + perPage);
  }, [orders, page]);

  const formatPrice = (num: number) =>
    num.toLocaleString("id-ID", { minimumFractionDigits: 2 });

  return (
    <div>

      <div className="bg-white">
        {/* Table */}
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
                <th className="py-3 px-4"></th>
              </tr>
            </thead>

            <tbody className="text-[#6C6C6C]">
              {paged.map((o, i) => (
                <tr key={o.id} className="justify-center">
                  <td className="py-0.5 px-4">{(page - 1) * perPage + i + 1}</td>
                  <td className="py-0.5 px-4">{o.id}</td>
                  <td className="py-0.5 px-4">{o.name}</td>
                  <td className="py-0.5 px-4">{o.payment}</td>
                  <td className="py-0.5 px-4">{formatPrice(o.price)}</td>
                  <td className="py-0.5 px-4">{o.items}x</td>
                  <td className="py-0.5 px-4">
                    {new Date(o.date).toLocaleDateString("id-ID")}
                  </td>

                  {/* STATUS BUTTON */}
                  <td className="py-4 px-6">
                    {o.status === "proses" && (
                      <button
                        className="
                            flex items-center gap-2
                            px-2 py-0.5 rounded-full
                            text-sm font-medium
                            bg-red-100 text-[#EB5714] border border-[#EB5714]
                            "
                      >
                        <span className="rounded-full border-7 border-red-500"></span>
                        Proses
                      </button>
                    )}

                    {o.status === "cancel" && (
                      <button
                        className="
                            flex items-center gap-2
                            px-2 py-0.5 rounded-full
                            text-sm font-medium
                            text-red-500 bg-red-100 border border-red-500
                            "
                      >
                        <span className="rounded-full border-7 border-red-500"></span>
                        Cancel
                      </button>
                    )}

                    {o.status === "selesai" && (
                      <button
                        className="
                            flex items-center gap-2
                            px-2 py-0.5 rounded-full
                            text-sm font-medium
                            text-green-600 bg-green-50 border border-green-600
                            "
                      >
                        <span className="rounded-full border-7 border-green-600"></span>
                        Done
                      </button>
                    )}
                  </td>

                  {/* DELETE ICON — hanya muncul jika PROSES atau SELESAI */}
                  <td className="py-4 px-6">
                    {(o.status === "proses" || o.status === "selesai") && (
                      <button
                        onClick={() => {
                          if (o.status === "proses") {
                            setSelectedForVoid(o); // buka modal void
                          } else {
                            // selesai → langsung hapus
                            setOrders(orders.filter((x) => x.id !== o.id));
                          }
                        }}
                        className="
                            w-8 h-8 rounded-full bg-red-100 
                            flex items-center justify-center
                            hover:bg-red-200 transition
                            "
                      >
                        <Trash2 size={15} className="text-[#DB2D2D]" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        
      {/* Page info + Pagination */}
      <div className="mt-4 flex justify-between text-sm h-[50] items-center">
        <p className="text-[#6C6C6C]">
          Data di tampilkan {Math.min(page * perPage, orders.length)} dari{" "}
          {orders.length}
        </p>

        <Pagination
          page={page}
          setPage={setPage}
          total={orders.length}
          perPage={perPage}
        />
      </div>

      {selectedForVoid && (
        <VoidModal
          order={selectedForVoid}
          onClose={() => setSelectedForVoid(null)}
          onConfirm={() =>
            setOrders(orders.filter((x) => x.id !== selectedForVoid.id))
          }
        />
      )}
    </div>
  );
}
