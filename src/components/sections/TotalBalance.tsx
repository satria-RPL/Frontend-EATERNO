"use client";

import incomeData from "@/data/income.json";
import Card from "../cards/Card";
import StatItem from "../cards/StatItem";

// komponen TotalBalance untuk menampilkan saldo total
export default function TotalBalance() {
  const totalIncome =
    incomeData.food + incomeData.drink + incomeData.others;

  const totalExpense = 9500000;
  const balance = totalIncome - totalExpense;

  return (
    <Card>
      <h2 className="text-xl font-semibold font-[Poppins] mb-4">Total Balance</h2>

      <div className="text-3xl font-[Outfit] font-semibold text-orange-500 text-center py-5">
        Rp {balance.toLocaleString("id-ID")}
      </div>

      <div className="mt-4 space-y-2">
        <StatItem
          label="Total Income"
          value={`Rp ${totalIncome.toLocaleString("id-ID")}`}
          color="text-green-600"
        />

        <StatItem
          label="Total Expense"
          value={`Rp ${totalExpense.toLocaleString("id-ID")}`}
          color="text-red-500"
        />
      </div>
    </Card>
  );
}
