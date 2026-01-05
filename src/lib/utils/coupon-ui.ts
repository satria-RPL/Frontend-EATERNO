// src/lib/utils/coupon-ui.ts
import type { Promotion } from "@/lib/services/couponService";

export type CouponUIState = "selected" | "available" | "expired";

export function getCouponUIState(
  coupon: Promotion,
  selectedCoupons: string[]
): CouponUIState {
  const now = new Date();
  const startAt = new Date(coupon.startAt);
  const endAt = new Date(coupon.endAt);

  // 1. Sudah dipilih user
  if (selectedCoupons.includes(coupon.name)) {
    return "selected";
  }

  // 2. Belum mulai atau sudah berakhir
  if (now < startAt || now > endAt) {
    return "expired";
  }

  // 3. Tersedia
  return "available";
}
