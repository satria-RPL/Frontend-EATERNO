"use client";

import Card from "../cards/Card";
import DaySellingAreaChart, {
  type SellingData,
  type SellingSeries,
} from "../charts/DaySellingAreaChart";

type DaySellingProps = {
  data: SellingData[];
  series: SellingSeries[];
};

export default function DaySelling({ data, series }: DaySellingProps) {
  const hasData = series.length > 0;

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Day Selling</h2>
      {!hasData && (
        <div className="text-sm text-gray-500 mb-3">Belum ada data.</div>
      )}
      <DaySellingAreaChart data={data} series={series} />
    </Card>
  );
}
