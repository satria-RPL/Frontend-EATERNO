"use client";

import incomeData from "@/data/income.json";
import Card from "../cards/Card";
import IncomePieChart, { COLORS } from "../charts/IncomePieChart";

export default function TotalIncome() {
  const data = [
    { name: "Food", value: incomeData.food },
    { name: "Drink", value: incomeData.drink },
    { name: "Others", value: incomeData.others },
  ];

  const total = data.reduce((a, b) => a + b.value, 0);
  const formattedTotal = total.toLocaleString("id-ID");

  return (
    <Card>
      <h2 className="text-lg font-semibold">Total Income</h2>

      <div className="flex flex-col items-center">
        <IncomePieChart data={data} />

        {/* Legend bawah chart, sesuai warna */}
        <div className="flex items-center gap-6 py-5">
          {data.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="inline-block w-5 h-2 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                aria-hidden
              />
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center font-semibold text-orange-600 text-base">
          Rp {formattedTotal}
        </div>
      </div>
    </Card>
  );
}
