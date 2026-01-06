"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TableCard from "@/components/cards/TableCard";
import { persistCheckoutState } from "@/lib/checkout/storage";
import { TablesService } from "@/lib/services/tablesService";

type TableUI = {
  id: number;
  label: string;
  disabled: boolean;
  size: "small" | "large";
};

export default function ChooseTable() {
  const [tables, setTables] = useState<TableUI[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    TablesService.getAll()
      .then((data) => {
        const mapped: TableUI[] = data.map((t) => ({
          id: t.id,
          label: t.name,
          disabled: t.status === "occupied",
          size: t.placeId === 1 ? "small" : "large", 
        }));
        setTables(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    persistCheckoutState({ tableId: selected });
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("table", selected.toString());
    const query = params.toString();
    router.push(query ? `/main/products/list?${query}` : "/main/products/list");
  };

  const smallTables = tables.filter((t) => t.size === "small");
  const largeTables = tables.filter((t) => t.size === "large");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Choose Table</h1>

      {/* Small */}
      <div className="grid grid-cols-10 gap-1 mb-10">
        {smallTables.map((t) => (
          <TableCard
            key={t.id}
            label={t.label}
            disabled={t.disabled}
            active={selected === t.id}
            onClick={() => setSelected(t.id)}
            size="small"
          />
        ))}
      </div>

      {/* Large */}
      <h2 className="font-medium mb-5">Kapasitas 3 Orang Ke Atas:</h2>
      <div className="grid grid-cols-4 gap-4">
        {largeTables.map((t) => (
          <TableCard
            key={t.id}
            label={t.label}
            disabled={t.disabled}
            active={selected === t.id}
            onClick={() => setSelected(t.id)}
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

