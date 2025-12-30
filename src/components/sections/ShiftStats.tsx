"use client";

import { useEffect, useMemo, useState } from "react";
import shiftData from "@/data/shiftStats.json";
import Card from "../cards/Card";
import StatItem from "../cards/StatItem";
import { fetchCashierShifts } from "@/lib/services/shiftService";
import {
  createShiftStatsLoader,
  formatDuration,
  type ShiftStatsSnapshot,
} from "@/domain/shift/shiftStats";

export default function ShiftStats({
  userName,
}: {
  userName?: string;
}) {
  const fallbackSnapshot = useMemo<ShiftStatsSnapshot>(
    () => ({
      checkIn: shiftData.checkIn,
      workDuration: shiftData.workDuration,
      openedAtMs: null,
    }),
    []
  );
  const [checkIn, setCheckIn] = useState(fallbackSnapshot.checkIn);
  const [workDuration, setWorkDuration] = useState(
    fallbackSnapshot.workDuration
  );
  const [openedAtMs, setOpenedAtMs] = useState<number | null>(
    fallbackSnapshot.openedAtMs
  );

  const stats = useMemo(
    () => ({
      inProcess: shiftData.inProcess,
      success: shiftData.success,
      income: shiftData.income,
    }),
    []
  );

  const { loadShiftStats } = useMemo(
    () => createShiftStatsLoader({ fetchCashierShifts }),
    []
  );

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const result = await loadShiftStats(fallbackSnapshot);
      if (!isActive) return;
      if (result.error) {
        console.error("Gagal memuat cashier shifts", result.error);
      }
      setOpenedAtMs(result.data.openedAtMs);
      setCheckIn(result.data.checkIn);
      setWorkDuration(result.data.workDuration);
    };

    load();

    return () => {
      isActive = false;
    };
  }, [fallbackSnapshot, loadShiftStats]);

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
      <h2 className="text-lg font-semibold mb-4">
        👋 Hai, {userName} - Statistik Shift Anda
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
