"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import Pagination from "../ui/Pagination";
import { TablesService } from "@/lib/services/tablesService";

type TableInfo = {
  id: number;
  placeId: number;
  name: string;
  capacity: number;
  status: "available" | "not_available";
};

export default function WaiterTableInfoTable() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const loadTables = async (isActive?: () => boolean) => {
    setLoading(true);
    try {
      const data = await TablesService.getAll();
      if (!isActive || isActive()) {
        setTables(data);
      }
    } catch {
      if (!isActive || isActive()) {
        setTables([]);
      }
    } finally {
      if (!isActive || isActive()) {
        setLoading(false);
      }
    }
  };

  const refreshTables = async (isActive?: () => boolean) => {
    try {
      const data = await TablesService.getAll();
      if (!isActive || isActive()) {
        setTables(data);
      }
    } catch {
      // Silent refresh failures keep existing UI state.
    }
  };

  useEffect(() => {
    let active = true;

    const isActive = () => active;

    loadTables(isActive);

    const intervalId = window.setInterval(() => {
      if (!active) return;
      refreshTables(isActive);
    }, 5000);

    const handler = (event: MessageEvent) => {
      if (!event.data || !active) return;
      const { tableId, status } = event.data as {
        tableId?: number;
        status?: TableInfo["status"];
      };
      if (!tableId || !status) return;
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, status } : table,
        ),
      );
    };
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("table-status");
      channelRef.current = channel;
      channel.addEventListener("message", handler);
    }

    return () => {
      active = false;
      window.clearInterval(intervalId);
      if (channelRef.current) {
        channelRef.current.removeEventListener("message", handler);
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, []);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return tables.slice(start, start + perPage);
  }, [tables, page, perPage]);

  const toggleStatus = async (table: TableInfo) => {
    const prevStatus = table.status;
    const nextStatus =
      table.status === "available" ? "not_available" : "available";
    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === table.id ? { ...t, status: nextStatus } : t,
      ),
    );

    try {
      await TablesService.update(table.id, {
        placeId: table.placeId,
        name: table.name,
        capacity: table.capacity,
        status: nextStatus,
      });
      channelRef.current?.postMessage({
        tableId: table.id,
        status: nextStatus,
      });
    } catch {
      setTables((prevTables) =>
        prevTables.map((t) =>
          t.id === table.id && t.status === nextStatus
            ? { ...t, status: prevStatus }
            : t,
        ),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-hidden p-3 sm:h-[calc(100vh-8rem)] sm:gap-6 sm:p-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">Table Info</h2>

        {/* filter & sort – digeser ke kiri */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 sm:mr-6 sm:gap-6">
          <div className="relative">
            <button
              className="flex items-center gap-1.5 hover:text-[#5f5f5f]"
              type="button"
              onClick={() => {
                setFilterOpen((p) => !p);
                setSortOpen(false);
              }}
            >
              <Filter size={20} />
              Filter
            </button>

            {filterOpen && (
              <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg bg-white p-2 text-[11px] shadow-md">
                <div className="px-2 py-1 text-zinc-500">Filter UI only</div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-1.5 hover:text-[#5f5f5f]"
              type="button"
              onClick={() => {
                setSortOpen((p) => !p);
                setFilterOpen(false);
              }}
            >
              <ArrowUpDown size={20} />
              Sort
            </button>

            {sortOpen && (
              <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg bg-white p-2 text-[11px] shadow-md">
                <div className="px-2 py-1 text-[#9a9a9a]">Sort UI only</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
          <div className="overflow-x-auto overflow-y-auto rounded-xl">
            <table className="w-full bg-white text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="text-zinc-500">
                  <td className="px-2 py-3 text-center sm:px-4 sm:py-4">#</td>
                  <td className="px-2 py-3 text-center sm:px-4 sm:py-4">
                    Table No
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4 sm:py-4">
                    Table for
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4 sm:py-4">
                    Status
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4 sm:py-4">
                    Aksi
                  </td>
                </tr>
              </thead>

              <tbody className="text-zinc-500">
                {!loading && paged.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-500">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}

                {paged.map((table, index) => {
                  const isAvailable = table.status === "available";

                  return (
                    <tr key={table.id}>
                      <td className="py-3 text-center sm:py-4">
                        {(page - 1) * perPage + index + 1}
                      </td>

                      <td className="py-3 text-center sm:py-4">{table.name}</td>

                      <td className="py-3 text-center sm:py-4">
                        {table.capacity}
                      </td>

                      <td className="py-3 text-center sm:py-4">
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border sm:h-5 sm:w-5 ${
                            !isAvailable
                              ? "border-[#EF4444] bg-red-50"
                              : "border-[#16a34a] bg-green-50"
                          }`}
                          aria-label={
                            isAvailable ? "Available" : "Not available"
                          }
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${
                              !isAvailable ? "bg-[#EF4444]" : "bg-[#16a34a]"
                            }`}
                          />
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            aria-label="Toggle Status"
                            onClick={() => toggleStatus(table)}
                            className={`relative h-7 w-14 rounded-full transition focus:outline-none sm:h-8 sm:w-17 ${!isAvailable ? "bg-[#FEE2E2] " : "bg-[#E5E7EB] "}`}
                            style={{ minWidth: 44, minHeight: 24, padding: 0 }}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full transition sm:top-1 sm:h-6 sm:w-6 ${!isAvailable ? "right-0.5 bg-[#EF4444]" : "left-0.5 bg-[#6B7280]"}`}
                              style={{
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                              }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-[#6f6f6f]">
          Data ditampilkan {Math.min(page * perPage, tables.length)} dari{" "}
          {tables.length}
        </p>

        <Pagination
          page={page}
          setPage={setPage}
          total={tables.length}
          perPage={perPage}
          setPerPage={setPerPage}
        />
      </div>
    </div>
  );
}
