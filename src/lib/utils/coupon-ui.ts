// src/lib/utils/coupon-ui.ts
import type { Coupon } from "@/domain/checkout/coupons";

export type CouponUIState = "selected" | "available" | "expired";

export function getCouponUIState(
  coupon: Coupon,
  selectedCoupons: string[]
): CouponUIState {
  const now = new Date();
  const startAt = parseCouponDate(coupon.startAt, "start");
  const endAt = parseCouponDate(coupon.endAt, "end");

  // 1. Sudah dipilih user
  if (selectedCoupons.includes(coupon.name)) {
    return "selected";
  }

  // 2. Belum mulai atau sudah berakhir
  if (startAt && now < startAt) {
    return "expired";
  }
  if (endAt && now > endAt) {
    return "expired";
  }

  // 3. Tersedia
  return "available";
}

type CouponDateMode = "start" | "end";

function parseCouponDate(value: string, mode: CouponDateMode) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnly.test(trimmed)) {
    const base = new Date(`${trimmed}T00:00:00`);
    if (Number.isNaN(base.getTime())) return null;
    if (mode === "end") {
      base.setHours(23, 59, 59, 999);
    }
    return base;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}
