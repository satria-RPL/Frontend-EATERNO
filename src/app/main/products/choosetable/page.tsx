"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TableCard from "@/components/cards/TableCard";
import { TablesService } from "@/lib/services/tablesService";
import { persistCheckoutState } from "@/lib/checkout/storage";

type TableUI = {
  id: number;
  label: string;
  disabled: boolean;
  size: "small" | "large";
  capacity: number;
};

export default function ChooseTable() {
  const [tables, setTables] = useState<TableUI[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const loadTables = useCallback(async (isActive?: () => boolean) => {
    try {
      const tablesData = await TablesService.getAll();

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
        .map((t) => ({
          id: t.id,
          label: t.name,
          disabled: t.status !== "available",
          size: t.capacity <= 3 ? "small" : "large",
          capacity: t.capacity ?? 0,
        }));

      if (!isActive || isActive()) {
        setTables(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshTables = useCallback(async () => {
    const tablesData = await TablesService.getAll();
    const disabledById = new Map(
      tablesData.map((table) => [table.id, table.status !== "available"])
    );
    setTables((prev) =>
      prev.map((t) => {
        const disabled = disabledById.get(t.id);
        if (disabled == null) return t;
        return disabled === t.disabled ? t : { ...t, disabled };
      })
    );
    setSelected((current) => {
      if (current == null) return current;
      const disabled = disabledById.get(current);
      return disabled ? null : current;
    });
  }, []);

  useEffect(() => {
    let active = true;

    const isActive = () => active;

    loadTables(isActive);

    const intervalId = window.setInterval(() => {
      if (!active) return;
      refreshTables();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [loadTables, refreshTables]);

  const handleContinue = () => {
    if (!selected) return;
    persistCheckoutState({ tableId: selected });
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("table", selected.toString());
    const query = params.toString();
    router.push(query ? `/main/products/list?${query}` : "/main/products/list");
  };

  const smallTables = tables.filter((t) => t.capacity <= 3);
  const largeTables = tables.filter((t) => t.capacity > 3);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">Choose Table</h1>

      {/* Small */}
      <div className="grid grid-cols-8 gap-3 mb-10 max-w-[720px]">
        {smallTables.slice(0, 16).map((t) => (
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
