"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderType() {
  const [selected, setSelected] = useState<"takeaway" | "dinein" | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) return;

    if (selected === "takeaway") {
      router.push("/main/products/list");
    } else {
      router.push("/main/products/choosetable");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-120 py-5">
      <h1 className="text-2xl font-semibold">Choose Order Type</h1>

      <div className="flex items-center justify-center gap-80">
        {/* TAKE AWAY */}
        <button
          onClick={() => setSelected("takeaway")}
          className={`border-2 rounded-2xl p-16 flex flex-col items-center gap-2 transition
            ${
              selected === "takeaway"
                ? "border-orange-500 text-orange-500"
                : "border-gray-300 hover:border-orange-400 hover:text-orange-400 opacity-50"
            }`}
        >
          <Image
            src="/icon/takeaway.jpg"
            height={150}
            width={150}
            alt="Take Away"
          />
          <span className="font-medium">Take Away</span>
        </button>

        {/* DINE IN */}
        <button
          onClick={() => setSelected("dinein")}
          className={`border-2 rounded-2xl p-16 flex flex-col items-center gap-2 transition
            ${
              selected === "dinein"
                ? "border-orange-500 text-orange-500"
                : "border-gray-300 hover:border-orange-400 hover:text-orange-400 opacity-50"
            }`}
        >
          <Image
            src="/icon/dinein.jpg"
            height={150}
            width={150}
            alt="Dine In"
          />
          <span className="font-medium">Dine In</span>
        </button>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className={`px-10 py-3 rounded-2xl font-medium text-white transition
          ${
            selected
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
      >
        Continue
      </button>
    </div>
  );
}
