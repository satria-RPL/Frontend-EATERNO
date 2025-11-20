import type { OrderFilter, OrderSummary } from "@/data/orders";
type FilterOption = { id: string; label: string; value: OrderFilter };
type ProductsHeaderProps = {
  activeFilter: OrderFilter;
  filters: ReadonlyArray<FilterOption>;
  orders: OrderSummary[];
  onChangeFilter: (value: OrderFilter) => void;
};

export function ProductsHeader({
  activeFilter,
  filters,
  orders,
  onChangeFilter,
}: ProductsHeaderProps) {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-3">Order Line</h1>

      <div className="flex gap-2">
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
              <span>{filter.label}</span>

              <span
                className={`rounded-full px-2 text-white text-xs
                  ${isActive ? "bg-orange-500" : "bg-orange-300"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
