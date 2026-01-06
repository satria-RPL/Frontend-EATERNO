"use client";

import Card from "../cards/Card";
import { FaChartLine } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";

type TotalBalanceProps = {
  totalIncome: number;
  totalExpense?: number;
};

export default function TotalBalance({
  totalIncome,
  totalExpense = 0,
}: TotalBalanceProps) {
  const balance = totalIncome - totalExpense;

  return (
    <Card>
      <div className="p-2">
        <h2 className="text-2xl font-medium mb-2">Total Balance</h2>

        {/* Balance besarnya */}
        <div className="text-4xl font-semibold text-orange-500 text-center py-4">
          Rp {balance.toLocaleString("id-ID")}
        </div>

        {/* Income & Expense */}
        <div className="mt-4 space-y-4">
          {/* Income */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <FaChartLine className="text-orange-500 text-lg" />
              </div>

              <div>
                <p className="text-sm">Total Income</p>
                <p className="font-semibold text-orange-500">
                  Rp {totalIncome.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 font-[Poppins]">
              (+60% increase)
            </p>
          </div>

          {/* Expense */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FaWallet className="text-gray-700 text-lg" />
              </div>

              <div>
                <p className="text-sm font-[Poppins]">Total Expense</p>
                <p className="font-semibold text-gray-700">
                  Rp {totalExpense.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 font-[Poppins]">
              (+10% increase)
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
