"use client";

import Card from "../cards/Card";
import { memo, useMemo } from "react";
import IncomePieChart, { COLORS } from "../charts/IncomePieChart";

type TotalIncomeProps = {
  data: { name: string; value: number }[];
};

function TotalIncomeComponent({ data }: TotalIncomeProps) {
  const hasData = data.length > 0;
  const total = useMemo(
    () => data.reduce((acc, item) => acc + item.value, 0),
    [data]
  );
  const formattedTotal = useMemo(() => total.toLocaleString("id-ID"), [total]);

  return (
    <Card className="cv-auto">
      <div className="p-2">
        <h2 className="text-2xl font-medium">Total Income</h2>

        <div className="flex flex-col items-center">
          {!hasData && (
            <div className="text-sm text-gray-500 mt-2">Belum ada data.</div>
          )}
          <IncomePieChart data={data} />

          {hasData && (
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
          )}
          <div className="mt-2 text-center font-semibold text-orange-600 text-base">
            Rp {formattedTotal}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(TotalIncomeComponent);
