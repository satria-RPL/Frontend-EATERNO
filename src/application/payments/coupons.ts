import { createCouponsLoader } from "@/domain/checkout/couponsLoader";
import { getCoupons } from "@/lib/services/couponService";

const { loadCoupons } = createCouponsLoader({ getCoupons });

export { loadCoupons };
