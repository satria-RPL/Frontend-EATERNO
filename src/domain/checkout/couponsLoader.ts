import { mapCoupons } from "./coupons";
import type { PromotionInput, PromotionRuleInput, Coupon } from "./coupons";

export type CouponsService = {
  getCoupons: () => Promise<{
    promotions: PromotionInput[];
    rules: PromotionRuleInput[];
  }>;
};

export function createCouponsLoader({ getCoupons }: CouponsService) {
  async function loadCoupons(): Promise<Coupon[]> {
    const { promotions, rules } = await getCoupons();
    return mapCoupons(promotions, rules);
  }

  return { loadCoupons };
}
