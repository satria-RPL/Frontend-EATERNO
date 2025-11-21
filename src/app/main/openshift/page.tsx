"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OpenShiftPage() {
  const [amount, setAmount] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    // Simpan data shift ke backend jika perlu
    router.push("/main/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="flex justify-center mb-4">
          <Image src="/logo-tomoro.png" alt="Tomoro Coffee" width={32} height={32} />
        </div>
        <h2 className="text-xl font-semibold text-center mb-4">Open Shift</h2>
        <label className="block text-center mb-2 font-medium">Total Uang Pembuka</label>
        <input
          type="number"
          className="border rounded-lg px-4 py-2 w-full text-center mb-6"
          placeholder="Rp"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button
          className={`w-full py-3 rounded-lg font-medium text-white transition ${
            amount ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!amount}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
  );
}