"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface Props {
  data: { name: string; value: number }[];
  height?: number;
}

export const COLORS = ["#F7BCA1", "#2F1104", "#EB5714"];

export default function IncomePieChart({ data, height = 200 }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const formatted = new Intl.NumberFormat("id-ID").format(total);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          dataKey="value"
          paddingAngle={4}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
          <Label
            value={`Rp ${formatted}`}
            position="center"
            fill="#111"
            fontSize={14}
            fontWeight={600}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
