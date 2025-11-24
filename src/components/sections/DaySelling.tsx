"use client";

import { sellingData } from "@/data/selling";
import Card from "../cards/Card";
import DaySellingAreaChart from "../charts/DaySellingAreaChart";

export default function DaySelling() {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Day Selling</h2>
      <DaySellingAreaChart data={sellingData} />
    </Card>
  );
}
