"use client";

import { useState } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import OrderTable from "@/components/sections/HistoryOrderTable";

type OrderHistoryViewProps = {
  authName?: string;
  authRole?: string;
};

type FilterValue = "all" | "proses" | "ready_to_pickup" | "selesai" | "cancel";
type SortValue = "newest" | "oldest";

export default function OrderHistoryView({
  authName,
  authRole,
}: OrderHistoryViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [activeSort, setActiveSort] = useState<SortValue>("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 px-2 py-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History Order</h1>
        <div className="flex items-center gap-4 text-xs text-[#8c8c8c]">
          <div className="relative">
            <button
              className="flex items-center gap-1.5 hover:text-[#5f5f5f]"
              onClick={() => {
                setFilterOpen((prev) => !prev);
                setSortOpen(false);
              }}
              type="button"
            >
              <Filter size={14} />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute z-50 right-0 mt-2 w-36 rounded-lg border border-[#e6e1dc] bg-white p-2 text-[11px] text-[#4b4b4b] shadow-md">
                {[
                  { label: "Semua", value: "all" },
                  { label: "Proses", value: "proses" },
                  { label: "Ready to Pickup", value: "ready_to_pickup" },
                  { label: "Done", value: "selesai" },
                  { label: "Cancel", value: "cancel" },
                ].map((item) => (
                  <button
                    key={item.value}
                    className={`w-full rounded-md px-2 py-1 text-left hover:bg-[#f4f2f1] ${
                      activeFilter === item.value
                        ? "font-semibold text-[#3f2f23]"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveFilter(item.value as FilterValue);
                      setFilterOpen(false);
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-1.5 hover:text-[#5f5f5f]"
              onClick={() => {
                setSortOpen((prev) => !prev);
                setFilterOpen(false);
              }}
              type="button"
            >
              <ArrowUpDown size={14} />
              Sort
            </button>
            {sortOpen && (
              <div className="absolute z-50 right-0 mt-2 w-36 rounded-lg border border-[#e6e1dc] bg-white p-2 text-[11px] text-[#4b4b4b] shadow-md">
                {[
                  { label: "Terbaru", value: "newest" },
                  { label: "Terlama", value: "oldest" },
                ].map((item) => (
                  <button
                    key={item.value}
                    className={`w-full rounded-md px-2 py-1 text-left hover:bg-[#f4f2f1] ${
                      activeSort === item.value
                        ? "font-semibold text-[#3f2f23]"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveSort(item.value as SortValue);
                      setSortOpen(false);
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <OrderTable
          authName={authName}
          authRole={authRole}
          activeFilter={activeFilter}
          activeSort={activeSort}
        />
      </div>
    </div>
  );
}
