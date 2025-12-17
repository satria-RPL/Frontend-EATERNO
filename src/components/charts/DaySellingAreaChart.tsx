"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  YAxis,
  Tooltip,
  XAxis,
  ResponsiveContainer,
} from "recharts";

interface SellingData {
  day: string;
  food: number;
  drink: number;
  others: number;
}

export default function DaySellingAreaChart({ data }: { data: SellingData[] }) {
  // Legend config: label + color
  const legends = [
    { key: "food", label: "Food", color: "#F97316" },
    { key: "drink", label: "Drink", color: "#0EA5E9" },
    { key: "others", label: "Others", color: "#6B7280" },
  ];

  // simple connector icon (two circles connected by a bar)
  const ConnectorIcon = ({ color }: { color: string }) => (
    <svg
      width="20"
      height="12"
      viewBox="0 0 20 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="inline-block"
    >
      <circle cx="3" cy="6" r="2" fill={color} />
      <rect x="5" y="5" width="10" height="2" rx="1" fill={color} />
      <circle cx="17" cy="6" r="2" fill={color} />
    </svg>
  );

  return (
    <div>
      <div className="w-full h-56">
        {/* samain/atur sesuai tinggi card */}
        <ResponsiveContainer width="95%" height="100%">
          {/* Chart */}
          <AreaChart
            width={300}
            height={200}
            data={data}
            className="object-contain w-full h-full"
          >
            <XAxis dataKey="day" />
            <defs>
              {/* FOOD */}
              <linearGradient id="food" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.1} />
              </linearGradient>

              {/* DRINK */}
              <linearGradient id="drink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1} />
              </linearGradient>

              {/* OTHERS */}
              <linearGradient id="others" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6B7280" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            {/* Custom Y ticks */}
            <YAxis ticks={[0, 20, 40, 60, 80, 100]} />

            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />

            {/* FOOD */}
            <Area
              type="monotone"
              dataKey="food"
              stroke="#F97316"
              fill="url(#food)"
              dot={{ r: 4 }}
            />

            {/* DRINK */}
            <Area
              type="monotone"
              dataKey="drink"
              stroke="#0EA5E9"
              fill="url(#drink)"
              dot={{ r: 4 }}
            />

            {/* OTHERS */}
            <Area
              type="monotone"
              dataKey="others"
              stroke="#6B7280"
              fill="url(#others)"
              dot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cleaner Legend: map dari konfigurasi, memakai SVG connector icon */}
      <div className="flex gap-6 mt-3 text-sm items-center justify-center">
        {legends.map((l) => (
          <div key={l.key} className="flex items-center gap-2">
            <ConnectorIcon color={l.color} />
            <span className="text-gray-700">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
