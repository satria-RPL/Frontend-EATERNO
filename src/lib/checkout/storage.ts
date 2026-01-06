export type CheckoutState = {
  customerName?: string;
  orderType?: "takeaway" | "dinein";
  tableId?: number | null;
  paymentMethod?: string;
  selectedCoupons?: string[];
  cashInput?: string;
};

const CHECKOUT_STORAGE_KEY = "eaterno-checkout";

export function readCheckoutState(): CheckoutState {
  if (typeof window === "undefined") return {};
  const saved = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved) as CheckoutState;
  } catch {
    return {};
  }
}

export function persistCheckoutState(next: Partial<CheckoutState>) {
  if (typeof window === "undefined") return {};
  const merged = { ...readCheckoutState(), ...next };
  window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function clearCheckoutState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
}
