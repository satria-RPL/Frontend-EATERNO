"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useCartStore } from "@/data/cart";
import Loading from "@/components/ui/Loading";
import { Wallet, QrCode, Landmark } from "lucide-react";

type PaymentMethod = "Qris" | "Cash" | "Bank";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<PaymentMethod>("Qris");
  const [cashInput, setCashInput] = useState<string>("");
  const cart = useCartStore((s) => s.cart);
  const getTotal = useCartStore((s) => s.getTotal);

  const totalAmount = useMemo(
    () => getTotal({ taxPercent: 10, discount: 0, rounding: 0 }),
    [cart, getTotal]
  );

  useEffect(() => {
    const paramMethod = searchParams?.get("method");
    if (!paramMethod) return;

    const normalized = paramMethod.toLowerCase();
    if (normalized === "cash") setMethod("Cash");
    if (normalized === "qris") setMethod("Qris");
    if (normalized === "bank") setMethod("Bank");
  }, [searchParams]);

  const cashNumber = Number(cashInput.replace(/\D/g, ""));
  const change = cashNumber > totalAmount ? cashNumber - totalAmount : 0;

  return (
    <main>
      <div className="p-4">
        {/* Header Tabs */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium">Payment via {method}</span>
        </div>

        <div className="flex gap-2 mb-4 text-xs">
          <TabButton
            label="QRIS"
            icon={<QrCode size={16} />}
            active={method === "Qris"}
            onClick={() => setMethod("Qris")}
          />
          <TabButton
            label="Cash"
            icon={<Wallet size={16} />}
            active={method === "Cash"}
            onClick={() => setMethod("Cash")}
          />
          <TabButton
            label="Bank"
            icon={<Landmark size={16} />}
            active={method === "Bank"}
            onClick={() => setMethod("Bank")}
          />
        </div>

        {/* Card Content */}
        <div className="p-4">
          {method === "Qris" && <QrisView total={totalAmount} />}
          {method === "Cash" && (
            <CashView
              total={totalAmount}
              cashInput={cashInput}
              setCashInput={setCashInput}
              change={change}
            />
          )}
          {method === "Bank" && <BankWaitingView total={totalAmount} />}
        </div>
      </div>
    </main>
  );
}

function TabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-5 rounded-md border flex items-center gap-2 transition font-semibold
      ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white border-orange-300 text-orange-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// === QRIS VIEW ===

function QrisView({ total }: { total: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-150 h-100 rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          <div className="w-14 h-14 border-8 border-gray-400 rounded-sm" />
          <div className="w-14 h-14 border-8 border-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-transparent" />
          <div className="w-14 h-14 border-8 border-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-start items-start w-145">
        <p className="font-medium">Total:</p>
        <p className="text-orange-500 font-medium">{formatRupiah(total)}</p>
      </div>
    </div>
  );
}

// === CASH VIEW ===

function CashView({
  total,
  cashInput,
  setCashInput,
  change,
}: {
  total: number;
  cashInput: string;
  setCashInput: (v: string) => void;
  change: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 font-medium">
        <span>Total</span>
        <span className="font-semibold text-[#ff7a1a]">
          {formatRupiah(total)}
        </span>
      </div>

      <div className="bg-neutral-50 py-2 px-8 rounded-2xl flex flex-col gap-y-4 my-5">
        <div className="space-y-1">
          <p className="font-medium">Pembayaran Cash</p>
          <input
            type="text"
            inputMode="numeric"
            value={cashInput}
            onChange={(e) => setCashInput(e.target.value)}
            placeholder="Rp"
            className="w-full rounded-md border-2 border-gray-200 px-2 py-1 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex justify-between items-center text-orange-500">
          <span>Return</span>
          <span className="text-orange-500">
            {change > 0 ? formatRupiah(change) : "-"}
          </span>
        </div>
      </div>

      <button className="mt-2 w-full rounded-md bg-orange-500 text-white py-2 font-normal flex items-center justify-center gap-1">
        Proses Order
      </button>
    </div>
  );
}

// === BANK / WAITING VIEW ===

function BankWaitingView({ total }: { total: number }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-2 w-full font-medium">
        <span>Total</span>
        <span className="font-medium text-orange-500">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
}
