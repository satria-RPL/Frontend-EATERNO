"use client";

// mengimpor data penjualan harian dari file JSON
import sellingData from "@/data/selling.json";
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
