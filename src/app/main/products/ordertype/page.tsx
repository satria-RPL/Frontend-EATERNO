"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function OrderType() {
  const [selected, setSelected] = useState<"takeaway" | "dinein" | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem("eaterno-checkout");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved) as { orderType?: string };
      if (parsed.orderType === "takeaway") return "takeaway";
      if (parsed.orderType === "dinein") return "dinein";
    } catch {}
    return null;
  });
  const [customerName, setCustomerName] = useState(() => {
    if (typeof window === "undefined") return "";
    const saved = window.localStorage.getItem("eaterno-checkout");
    if (!saved) return "";
    try {
      const parsed = JSON.parse(saved) as { customerName?: string };
      return parsed.customerName ?? "";
    } catch {
      return "";
    }
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("eaterno-checkout");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CheckoutState;
      const customer = parsed.customerName?.trim();
      const orderType = parsed.orderType;
      if (!customer || !orderType) return;

      const params = new URLSearchParams();
      params.set("name", customer);
      params.set("orderType", orderType);

      if (orderType === "dinein") {
        if (parsed.tableId) {
          params.set("table", String(parsed.tableId));
          router.replace(`/main/products/list?${params.toString()}`);
        } else {
          router.replace(`/main/products/choosetable?${params.toString()}`);
        }
        return;
      }

      router.replace(`/main/products/list?${params.toString()}`);
    } catch {}
  }, [router]);

  const isFormValid = Boolean(selected) && customerName.trim().length > 0;

  const handleContinue = () => {
    if (!isFormValid) return;

    if (selected === "takeaway") {
      const params = new URLSearchParams();
      params.set("name", customerName.trim());
      params.set("orderType", "takeaway");
      persistCheckoutState({
        customerName: customerName.trim(),
        orderType: "takeaway",
      });
      router.push(`/main/products/list?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      params.set("name", customerName.trim());
      params.set("orderType", "dinein");
      persistCheckoutState({
        customerName: customerName.trim(),
        orderType: "dinein",
      });
      router.push(`/main/products/choosetable?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-120 py-5 gap-10">
      <h1 className="text-2xl font-semibold">Choose Order Type</h1>

      <div className="flex items-center justify-center gap-20">
        {/* TAKE AWAY */}
        <button
          onClick={() => {
            setSelected("takeaway");
            persistCheckoutState({ orderType: "takeaway" });
          }}
          className={`border-2 rounded-2xl p-10 flex flex-col items-center gap-2 transition
            ${
              selected === "takeaway"
                ? "border-orange-500 text-orange-500"
                : "border-gray-300 hover:border-orange-400 hover:text-orange-400 opacity-50"
            }`}
        >
          <Image
            src="/icon/takeaway.jpg"
            height={120}
            width={120}
            alt="Take Away"
          />
          <span className="font-medium">Take Away</span>
        </button>

        {/* DINE IN */}
        <button
          onClick={() => {
            setSelected("dinein");
            persistCheckoutState({ orderType: "dinein" });
          }}
          className={`border-2 rounded-2xl p-10 flex flex-col items-center gap-2 transition
            ${
              selected === "dinein"
                ? "border-orange-500 text-orange-500"
                : "border-gray-300 hover:border-orange-400 hover:text-orange-400 opacity-50"
            }`}
        >
          <Image
            src="/icon/dinein.jpg"
            height={120}
            width={120}
            alt="Dine In"
          />
          <span className="font-medium">Dine In</span>
        </button>
      </div>

      {/* Input Nama Customer */}
      <div className="w-full max-w-md">
        <label className="block mb-2 text-lg font-semibold">
          Nama Customer
        </label>

      <input
        type="text"
        placeholder="Nama"
        value={customerName}
        onChange={(e) => {
          const value = e.target.value;
          setCustomerName(value);
          persistCheckoutState({ customerName: value });
        }}
        className="w-full border-2 rounded-xl px-4 py-3 outline-none border-gray-300 focus:border-orange-500 transition"
      />
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={!isFormValid}
        size="lg"
        className={`w-full max-w-md rounded-2xl font-medium transition ${
          isFormValid ? "hover:opacity-90" : "bg-gray-300"
        }`}
      >
        Continue
      </Button>
    </div>
  );
}

function persistCheckoutState(next: Partial<CheckoutState>) {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem("eaterno-checkout");
  let current: CheckoutState = {};
  if (saved) {
    try {
      current = JSON.parse(saved) as CheckoutState;
    } catch {
      current = {};
    }
  }
  const merged = { ...current, ...next };
  window.localStorage.setItem("eaterno-checkout", JSON.stringify(merged));
}

type CheckoutState = {
  customerName?: string;
  orderType?: "takeaway" | "dinein";
  tableId?: number | null;
  paymentMethod?: string;
  selectedCoupons?: string[];
  cashInput?: string;
};
