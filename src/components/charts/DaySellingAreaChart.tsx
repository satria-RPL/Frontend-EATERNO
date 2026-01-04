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

export type SellingSeries = {
  key: string;
  label: string;
  color: string;
};

export type SellingData = {
  day: string;
} & Record<string, number>;

const DEFAULT_SERIES: SellingSeries[] = [
  { key: "food", label: "Food", color: "#F97316" },
  { key: "drink", label: "Drink", color: "#0EA5E9" },
  { key: "others", label: "Others", color: "#6B7280" },
];

export default function DaySellingAreaChart({
  data,
  series = DEFAULT_SERIES,
}: {
  data: SellingData[];
  series?: SellingSeries[];
}) {
  const legends = series;

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
              {legends.map((legend) => (
                <linearGradient
                  key={legend.key}
                  id={legend.key}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={legend.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={legend.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>

            {/* Custom Y ticks */}
            <YAxis ticks={[0, 20, 40, 60, 80, 100]} />

            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />

            {legends.map((legend) => (
              <Area
                key={legend.key}
                type="monotone"
                dataKey={legend.key}
                stroke={legend.color}
                fill={`url(#${legend.key})`}
                dot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Cleaner Legend: map dari konfigurasi, memakai SVG connector icon */}
      <div className="flex gap-6 mt-3 text-sm items-center justify-center">
        {legends.map((legend) => (
          <div key={legend.key} className="flex items-center gap-2">
            <ConnectorIcon color={legend.color} />
            <span className="text-gray-700">{legend.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
