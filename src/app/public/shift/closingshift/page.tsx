"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ShiftModal from "@/components/modals/ShiftModal";

function formatCashInput(value: string) {
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ClosingShiftPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isRouting, startRouting] = useTransition();

  const handleContinue = () => {
    if (!amount) return;
    setShowModal(true);
  };

  const handleModalContinue = () => {
    startRouting(() => router.push("/public/shift/statclosing"));
  };

  return (
    <div className="flex flex-col justify-center py-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 sm:px-8 lg:px-24 xl:px-32">
        <h2 className="mb-2 text-center text-3xl font-medium sm:text-4xl">
          Closing Shift
        </h2>

        <label className="mb-2 text-left text-2xl font-medium sm:text-3xl">
          Total Uang Terakhir
        </label>

        <input
          type="text"
          inputMode="numeric"
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
          placeholder="Rp"
          required
          value={formatCashInput(amount)}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
        />

        <button
          type="button"
          className={`w-full rounded-lg py-3 font-medium text-white transition ${
            amount
              ? "bg-orange-500 hover:bg-orange-600"
              : "cursor-not-allowed bg-gray-300"
          }`}
          disabled={!amount}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>

      <ShiftModal
        open={showModal}
        amount={Number(amount || 0)}
        onCancel={() => setShowModal(false)}
        onContinue={handleModalContinue}
        pending={isRouting}
        title="Closing Shift?"
        description="Dengan Total Penutup"
      />
    </div>
  );
}
