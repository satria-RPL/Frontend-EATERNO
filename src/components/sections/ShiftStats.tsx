"use client";

import shiftData from "@/data/shiftStats.json";
import Card from "../cards/Card";
import StatItem from "../cards/StatItem";

// komponen ShiftStats untuk menampilkan statistik shift kasir
export default function ShiftStats() {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">
        👋 Hai, [Nama Kasir] — Statistik Shift Anda
      </h2>

        {/* // menampilkan berbagai statistik terkait shift kasir */}
      <div className="mt-1 space-y-1 font-medium p-3 text-white">
        <StatItem label="Jam Check-in" value={shiftData.checkIn} />
        <StatItem label="Waktu Kerja" value={shiftData.workDuration} />
        <StatItem label="Total Pesanan Diproses" value={shiftData.inProcess} />
        <StatItem label="Total Pesanan Sukses" value={shiftData.success} />
        <StatItem
          label="Total Uang Masuk"
          value={`Rp ${shiftData.income.toLocaleString("id-ID")}`}
          color="text-white"
        />
      </div>
    </Card>
  );
}
