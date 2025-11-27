"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { logout } from "@/app/auth/login/actions";
import ShiftModal from "@/components/modals/ShiftModal";

export default function ClosingShiftPage() {
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    if (!amount) return;
    setShowModal(true);
  };

  const handleModalContinue = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex justify-center mb-4">
          <Image
            src="/img/brand.png"
            alt="Tomoro Coffee"
            width={400}
            height={400}
          />
        </div>
        <h2 className="text-xl font-semibold text-center mb-4">Closing Shift</h2>
        <label className="block text-center mb-2 font-medium">
          Total Uang Penutup
        </label>
        <input
          type="number"
          name="amount"
          className="border rounded-lg px-4 py-2 w-full text-center mb-6"
          placeholder="Rp"
          min={0}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          type="button"
          className={`w-full py-3 rounded-lg font-medium text-white transition ${
            amount && !isPending
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!amount || isPending}
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
        pending={isPending}
        title="Closing Shift?"
        description="Dengan Total Penutup"
      />
    </div>
  );
}
