"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ShiftModal from "@/components/modals/ShiftModal";

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
    <div className="flex flex-col justify-center py-10">
      <div className="flex flex-col justify-between w-full gap-20 px-48">
        <h2 className="text-4xl font-medium text-center mb-4">Closing Shift</h2>

        <label className="flex justify-start text-center mb-2 font-medium text-3xl">
          Total Uang Terakhir
        </label>

        <input
          type="number"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-6"
          placeholder="Rp"
          min={0}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          type="button"
          className={`w-full py-3 rounded-lg font-medium text-white transition ${
            amount
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-gray-300 cursor-not-allowed"
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
