"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ShiftModal from "@/components/modals/ShiftModal";

export default function OpenShiftPage() {
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleContinue = () => {
    if (!amount) return;
    setShowModal(true);
  };

  const handleModalContinue = () => {
    startTransition(() => router.push("/main/dashboard"));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex justify-center mb-4">
        <Image
          src="/icon/brand.svg"
          alt="Tomoro Coffee"
          width={400}
          height={400}
        />
      </div>
      <h2 className="text-xl font-semibold text-center mb-4">Open Shift</h2>
      <label className="block text-center mb-2 font-medium">
        Total Uang Pembuka
      </label>
      <input
        type="number"
        className="border rounded-lg px-4 py-2 w-full text-center mb-6"
        placeholder="Rp"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
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

      <ShiftModal
        open={showModal}
        amount={Number(amount || 0)}
        onCancel={() => setShowModal(false)}
        onContinue={handleModalContinue}
        pending={isPending}
        title="Start Shift?"
        description="Dengan Total Pembukaan"
      />
    </div>
  );
}
