export type PromotionInput = {
  id: number;
  placeId: number;
  name: string;
  startAt: string;
  endAt: string;
};

export type PromotionRuleInput = {
  promotionId: number;
  ruleType: "percentage_discount" | "fixed_discount";
  value: string | number;
};

export type CouponRule = {
  type: "percentage_discount" | "fixed_discount";
  value: number;
};

export type Coupon = {
  id: number;
  name: string;
  placeId: number;
  startAt: string;
  endAt: string;
  rules: CouponRule[];
};

export function mapCoupons(
  promotions: PromotionInput[],
  rules: PromotionRuleInput[]
): Coupon[] {
  return promotions.map((promo) => ({
    id: promo.id,
    name: promo.name,
    placeId: promo.placeId,
    startAt: promo.startAt,
    endAt: promo.endAt,
    rules: rules
      .filter((rule) => rule.promotionId === promo.id)
      .map((rule) => ({
        type: rule.ruleType,
        value: Number(rule.value),
      })),
  }));
}
