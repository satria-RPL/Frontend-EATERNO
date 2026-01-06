import type { OrderFilter, OrderSummary } from "@/data/orders";
import { ArrowLeft } from "lucide-react";

type FilterOption = { id: string; label: string; value: OrderFilter };

type ProductsHeaderProps = {
  activeFilter: OrderFilter;
  filters: ReadonlyArray<FilterOption>;
  orders: OrderSummary[];
  onChangeFilter: (value: OrderFilter) => void;
  onBack: () => void; // ⬅️ TAMBAH
};

export function ProductsHeader({
  activeFilter,
  filters,
  orders,
  onChangeFilter,
  onBack,
}: ProductsHeaderProps) {
  return (
    <section className="flex items-start justify-between mb-3">
      {/* LEFT */}
      <div>
        <h1 className="font-semibold text-2xl mb-3">Order Line</h1>

        <div className="flex gap-2 rounded-full">
          {filters.map((filter) => {
            const count =
              filter.value === "all"
                ? orders.length
                : orders.filter((order) => order.type === filter.value).length;

            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.id}
                onClick={() => onChangeFilter(filter.value)}
                className={`flex items-center justify-between gap-8 rounded-full px-3 py-1 text-sm border-2 transition cursor-pointer
                  ${
                    isActive
                      ? "border-orange-500 text-orange-500 bg-orange-50"
                      : "border-gray-200 text-gray-400 bg-white"
                  }`}
              >
                <span className="rounded-full py-1">{filter.label}</span>

                <span
                  className={`rounded-full px-1.5 py-0.5 text-white text-xs flex text-center
                    ${isActive ? "bg-orange-500" : "bg-orange-300"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition"
      >
        <ArrowLeft size={16} />
        Ganti Order
      </button>
    </section>
  );
}
