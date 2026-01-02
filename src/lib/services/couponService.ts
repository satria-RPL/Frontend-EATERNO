export type Promotion = {
  id: number;
  placeId: number;
  name: string;
  startAt: string;
  endAt: string;
};

export type PromotionRule = {
  id: number;
  promotionId: number;
  ruleType: "percentage_discount" | "fixed_discount";
  value: string;
};

type CouponResponse = {
  promotions: Promotion[];
  rules: PromotionRule[];
};

export async function getCoupons(): Promise<CouponResponse> {
  const res = await fetch("/api/promotions", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed load coupons (${res.status})`);
  }

  return res.json();
}
