"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
const STORAGE_KEY = "table-status-overrides";
const channel = new BroadcastChannel("table-status");


type TableInfo = {
  id: number;
  placeId: number;
  name: string;
  capacity: number;
  status: "available" | "not_available" | "occupied";
};

export default function WaiterTableInfoTable() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/tables", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message ?? "Gagal mengambil data tables");
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;

        const raw = localStorage.getItem(STORAGE_KEY);
        const overrides = raw ? JSON.parse(raw) : {};

        const merged = data.map((t: TableInfo) => ({
          ...t,
          status: overrides[t.id] ?? t.status,
        }));

        setTables(merged);
      })

      .catch(() => {
        if (active) setTables([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return tables.slice(start, start + perPage);
  }, [tables, page, perPage]);

  // Toggle the status of a table by id
  //ini yang di ganti
  const toggleStatus = (table: TableInfo) => {
    const nextStatus =
      table.status === "available" ? "not_available" : "available";

    const raw = localStorage.getItem(STORAGE_KEY);
    const overrides = raw ? JSON.parse(raw) : {};

    overrides[table.id] = nextStatus;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));

    setTables((prevTables) =>
      prevTables.map((t) =>
        t.id === table.id ? { ...t, status: nextStatus } : t
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 p-4 overflow-hidden bg-[#FFFFFF]">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Table Info</h2>

        {/* filter & sort – digeser ke kiri */}
        <div className="flex items-center gap-6 text-xs text-zinc-500 mr-6">
          <div className="relative">
            <button
              className="flex items-center gap-1.5 hover:text-[#5f5f5f]"
              type="button"
              onClick={() => {
                setFilterOpen((p) => !p);
                setSortOpen(false);
              }}
            >
              <Filter size={23} />
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
              <ArrowUpDown size={23} />
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
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-2xl">
        <table className="w-full text-base bg-white">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="text-zinc-500">
              <td className="py-4 px-5 text-center">#</td>
              <td className="py-4 px-5 text-center">Table No</td>
              <td className="py-4 px-5 text-center">Table for</td>
              <td className="py-4 px-5 text-center">Status</td>
              <td className="py-4 px-5 text-center">Aksi</td>
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
                <tr key={table.id} className="">
                  <td className="py-5 text-center">
                    {(page - 1) * perPage + index + 1}
                  </td>

                  <td className="py-5 text-center">{table.name}</td>

                  <td className="py-5 text-center">{table.capacity}</td>

                  <td className="py-5 text-center">
                    {!isAvailable ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-[#EF4444] px-2 py-1 text-base font-medium text-[#EF4444]">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#EF4444]" />
                        Not Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border bg-green-50 border-[#16a34a] px-2 py-1 text-base font-medium text-[#16a34a]">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#16a34a]" />
                        Available
                      </span>
                    )}
                  </td>

                  {/* AKSI */}
                  <td className="py-3 text-center">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        aria-label="Toggle Status"
                        onClick={() => toggleStatus(table)}
                        className={`relative h-8 w-17 rounded-full transition focus:outline-none ${
                          !isAvailable ? "bg-[#FEE2E2] " : "bg-[#E5E7EB] "
                        }`}
                        style={{ minWidth: 44, minHeight: 24, padding: 0 }}
                      >
                        <span
                          className={`absolute top-1 h-6 w-6 rounded-full transition ${
                            !isAvailable
                              ? "right-0.5 bg-[#EF4444]"
                              : "left-0.5 bg-[#6B7280]"
                          }`}
                          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
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

      {/* PAGINATION
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
      </div> */}
    </div>
  );
}
