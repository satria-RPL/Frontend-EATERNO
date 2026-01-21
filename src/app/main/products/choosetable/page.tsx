"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TableCard from "@/components/cards/TableCard";
import { TablesService } from "@/lib/services/tablesService";

type TableUI = {
  id: number;
  label: string;
  disabled: boolean;
  size: "small" | "large";
  capacity: number;
};

type TableStatus = "available" | "not_available" | "occupied";

export default function ChooseTable() {
  const [tables, setTables] = useState<TableUI[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const applyOverrides = useCallback((overrides: Record<number, TableStatus>) => {
    setTables((prev) =>
      prev.map((t) => {
        const status = overrides[t.id];
        if (!status) return t;
        const disabled = status !== "available";
        return disabled === t.disabled ? t : { ...t, disabled };
      })
    );
  }, []);

  const loadTables = useCallback(async (isActive?: () => boolean) => {
    try {
      const [tablesData, overridesRes] = await Promise.all([
        TablesService.getAll(),
        fetch("/api/table-status", { cache: "no-store" }),
      ]);

      const overrides = overridesRes.ok
        ? ((await overridesRes.json()) as Record<number, TableStatus>)
        : {};

      const mapped: TableUI[] = tablesData
        .slice()
        .sort((a, b) => {
          const aNum = Number(String(a.name).replace(/\D/g, ""));
          const bNum = Number(String(b.name).replace(/\D/g, ""));
          if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
            return aNum - bNum;
          }
          return String(a.name).localeCompare(String(b.name));
        })
        .slice(0, 16)
        .map((t) => {
        const finalStatus = overrides[t.id] ?? t.status;

        return {
          id: t.id,
          label: t.name,
          disabled: finalStatus !== "available",
          size: t.capacity <= 4 ? "small" : "large",
          capacity: t.capacity ?? 0,
        };
      });

      if (!isActive || isActive()) {
        setTables(mapped);
        setCapacityFilter((current) => current ?? 2);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshOverrides = useCallback(async () => {
    const res = await fetch("/api/table-status", { cache: "no-store" });
    if (!res.ok) return;
    const overrides = (await res.json()) as Record<number, TableStatus>;
    applyOverrides(overrides);
  }, [applyOverrides]);

  useEffect(() => {
    let active = true;

    const isActive = () => active;

    loadTables(isActive);

    const intervalId = window.setInterval(() => {
      if (!active) return;
      refreshOverrides();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [loadTables, refreshOverrides]);

  const handleContinue = () => {
    if (!selected) return;
    persistCheckoutState({ tableId: selected });
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("table", selected.toString());
    const query = params.toString();
    router.push(query ? `/main/products/list?${query}` : "/main/products/list");
  };

  const visibleTables = tables.filter((t) =>
    capacityFilter ? t.capacity >= capacityFilter : true
  );
  const smallTables = visibleTables.filter((t) => t.size === "small");
  const largeTables = visibleTables.filter((t) => t.size === "large");
  const capacityOptions = [2, 4, 8, 10];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">Choose Table</h1>

      {/* Small */}
      <div className="grid grid-cols-8 gap-3 mb-10 max-w-[720px]">
        {smallTables.map((t) => (
          <TableCard
            key={t.id}
            label={t.label}
            disabled={t.disabled}
            active={selected === t.id}
            onClick={() => {
              if (!t.disabled) setSelected(t.id);
            }}
            size="small"
          />
        ))}
      </div>

      {/* Large */}
      <h2 className="font-medium mb-5">Kapasitas 3 Orang Ke Atas:</h2>
      <div className="flex flex-wrap gap-3 mb-6">
        {capacityOptions.map((capacity) => {
          const isActive = capacityFilter === capacity;
          return (
            <button
              key={capacity}
              type="button"
              onClick={() => {
                setCapacityFilter(capacity);
                setSelected(null);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              Kapasitas {capacity}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-4 max-w-[640px]">
        {largeTables.map((t) => (
          <TableCard
            key={t.id}
            label={t.label}
            disabled={t.disabled}
            active={selected === t.id}
            onClick={() => {
              if (!t.disabled) setSelected(t.id);
            }}
            size="large"
          />
        ))}
      </div>

      <div className="flex justify-end mt-10">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`px-10 py-3 rounded-xl text-white transition
            ${
              selected
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function persistCheckoutState(next: Partial<CheckoutState>) {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem("eaterno-checkout");
  let current: CheckoutState = {};
  if (saved) {
    try {
      current = JSON.parse(saved) as CheckoutState;
    } catch {
      current = {};
    }
  }
  const merged = { ...current, ...next };
  window.localStorage.setItem("eaterno-checkout", JSON.stringify(merged));
}

type CheckoutState = {
  customerName?: string;
  orderType?: "takeaway" | "dinein";
  tableId?: number | null;
  paymentMethod?: string;
  selectedCoupons?: string[];
  cashInput?: string;
};
