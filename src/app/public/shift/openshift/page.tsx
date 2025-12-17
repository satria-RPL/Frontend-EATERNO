"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import ShiftModal from "@/components/modals/ShiftModal";

export default function OpenShiftPage() {
  const [shift, setShift] = useState("");
  const [station, setStation] = useState("");
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isRouting, startRouting] = useTransition();

  const router = useRouter();
  const amountNumber = Number(amount);
  const isAmountValid = !Number.isNaN(amountNumber) && amountNumber > 0;

  const isFormValid = shift !== "" && station !== "" && isAmountValid;

  const handleContinue = () => {
    if (!isFormValid) return;
    setShowModal(true);
  };

  const handleModalContinue = () => {
    startRouting(() => router.push("/main/dashboard"));
  };

  return (
    <div className="w-full mx-auto pt-10 gap-10 flex flex-col px-50">
      {/* Shift */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">Shift</label>
        <div className="relative">
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 appearance-none text-gray-700"
          >
            <option value="">Pilih Shift</option>
            <option value="pagi">Shift Pagi</option>
            <option value="siang">Shift Siang</option>
            <option value="malam">Shift Malam</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Station */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">Station</label>
        <div className="relative">
          <select
            value={station}
            onChange={(e) => setStation(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 appearance-none text-gray-700"
          >
            <option value="">Pilih Station</option>
            <option value="kasir1">Kasir 1</option>
            <option value="kasir2">Kasir 2</option>
            <option value="drive">Drive Thru</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Total Uang Pembuka */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">
          Total Uang Pembuka
        </label>
        <input
          type="number"
          min={0}
          placeholder="Rp"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        />
      </div>

      {/* Button Continue */}
      <button
        disabled={!isFormValid}
        onClick={handleContinue}
        className={`w-full py-3 rounded-lg font-medium text-white transition
          ${
            !isFormValid
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }
        `}
      >
        Continue
      </button>

      <ShiftModal
        open={showModal}
        amount={isAmountValid ? amountNumber : 0}
        onCancel={() => setShowModal(false)}
        onContinue={handleModalContinue}
        pending={isRouting}
        title="Start Shift?"
        description="Dengan Total Pembukaan"
      />
    </div>
  );
}
