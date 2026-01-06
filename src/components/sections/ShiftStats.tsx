"use client";

import { useEffect, useState } from "react";
import Card from "../cards/Card";
import StatItem from "../cards/StatItem";
import {
  formatDuration,
  type ShiftStatsMetrics,
  type ShiftStatsSnapshot,
} from "@/domain/shift/shiftStats";

type ShiftStatsProps = {
  userName?: string;
  snapshot: ShiftStatsSnapshot;
  metrics: ShiftStatsMetrics;
};

export default function ShiftStats({ userName, snapshot, metrics }: ShiftStatsProps) {
  const [checkIn, setCheckIn] = useState(snapshot.checkIn);
  const [workDuration, setWorkDuration] = useState(snapshot.workDuration);
  const [openedAtMs, setOpenedAtMs] = useState<number | null>(
    snapshot.openedAtMs
  );
  const [stats, setStats] = useState(metrics);

  useEffect(() => {
    setOpenedAtMs(snapshot.openedAtMs);
    setCheckIn(snapshot.checkIn);
    setWorkDuration(snapshot.workDuration);
    setStats(metrics);
  }, [metrics, snapshot]);

  useEffect(() => {
    if (openedAtMs == null) return;

    setWorkDuration(formatDuration(Date.now() - openedAtMs));
    const interval = setInterval(() => {
      setWorkDuration(formatDuration(Date.now() - openedAtMs));
    }, 1_000);

    return () => clearInterval(interval);
  }, [openedAtMs]);

  return (
    <Card>
      <h2 className="text-2xl font-medium mb-2">
        👋 Hai {userName}, Statistik Shift Anda
      </h2>
      <div className="mt-1 space-y-1 font-medium p-3 text-white">
        <StatItem label="Jam Check-in" value={checkIn} />
        <StatItem label="Waktu Kerja" value={workDuration} />
        <StatItem label="Total Pesanan Diproses" value={stats.inProcess} />
        <StatItem label="Total Pesanan Sukses" value={stats.success} />
        <StatItem
          label="Total Uang Masuk"
          value={`Rp ${stats.income.toLocaleString("id-ID")}`}
          color="text-white"
        />
      </div>
    </Card>
  );
}
