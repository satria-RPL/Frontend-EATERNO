import { calculateRounding } from "@/lib/rounding";
import type { Coupon } from "./coupons";

type TotalsInput = {
  subtotal: number;
  taxPercent?: number;
  coupons?: Coupon[];
  selectedCoupons?: string[];
  roundingStep?: number;
};

export function calculateDiscount(
  subtotal: number,
  coupons: Coupon[] = [],
  selectedCoupons: string[] = []
) {
  let totalDiscount = 0;

  const activeCoupons = coupons.filter((coupon) =>
    selectedCoupons.includes(coupon.name)
  );

  for (const coupon of activeCoupons) {
    for (const rule of coupon.rules ?? []) {
      if (rule.type === "percentage_discount") {
        totalDiscount += (subtotal * rule.value) / 100;
      }

      if (rule.type === "fixed_discount") {
        totalDiscount += rule.value;
      }
    }
  }

  return Math.min(totalDiscount, subtotal);
}

export function calculateTotals({
  subtotal,
  taxPercent = 10,
  coupons = [],
  selectedCoupons = [],
  roundingStep = 500,
}: TotalsInput) {
  const discount = calculateDiscount(subtotal, coupons, selectedCoupons);
  const tax = Math.round((subtotal * taxPercent) / 100);
  const baseTotal = subtotal + tax - discount;
  const { roundedTotal, rounding } = calculateRounding(baseTotal, roundingStep);

  return {
    discount,
    tax,
    baseTotal,
    rounding,
    total: roundedTotal,
  };
}
