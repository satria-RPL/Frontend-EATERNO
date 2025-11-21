"use client";

import { PieChart, Pie, Cell } from "recharts";

interface Props {
  data: { name: string; value: number }[];
  width?: number;
  height?: number;
}

export const COLORS = ["#F7BCA1", "#2F1104", "#EB5714"];

// komponen IncomePieChart untuk menampilkan diagram pai pendapatan
export default function IncomePieChart({ data, width = 400, height = 200 }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const formatted = new Intl.NumberFormat("id-ID").format(total);

  const cx = width / 2;
  const cy = height / 2;

  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        cx={cx}
        cy={cy}
        innerRadius={50}
        outerRadius={80}
        dataKey="value"
        paddingAngle={4}
        labelLine={false}
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>

      {/* Center label: currency + formatted total */}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
        <tspan x={cx} dy="0.5em" fontSize={14} fontWeight={600} fill="#111">
          Rp.{formatted}
        </tspan>
      </text>
    </PieChart>
  );
}
