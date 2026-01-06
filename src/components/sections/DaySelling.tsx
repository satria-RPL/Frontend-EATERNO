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
      <div className="p-2">
        <h2 className="text-2xl font-medium">Day Selling</h2>
        {!hasData && (
          <div className="text-sm text-gray-500 mb-3">Belum ada data.</div>
        )}
        <DaySellingAreaChart data={data} series={series} />
      </div>
    </Card>
  );
}
