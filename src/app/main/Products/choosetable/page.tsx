"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TableCard from "@/components/cards/TableCard";
import { tablesSmall, tablesLarge } from "@/data/tables";

export default function ChooseTable() {
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) return;
    router.push("/main/products/list");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Choose Table</h1>

      {/* --- Small Capacity --- */}
      <div className="grid grid-cols-8 gap-4 mb-10">
        {tablesSmall.map((t) => (
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

      {/* --- Large Capacity --- */}
      <h2 className="font-medium mb-5">Kapasitas 3 Orang Ke Atas:</h2>
      <div className="grid grid-cols-4 gap-4">
        {tablesLarge.map((t) => (
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
