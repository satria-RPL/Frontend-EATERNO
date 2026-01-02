// src/data/cart.ts
import { create } from "zustand";

export type CartAddon = {
  id: string;
  name: string;
  price: number;
  qty: number;
  variantId?: string;
  menuVariantItemId?: string;
};

export type CartItem = {
  productId: number;
  productName: string;
  price: number;
  qty: number;
  addons: CartAddon[];
};

type CartState = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, lineKey?: string) => void;
  updateItemQty: (productId: number, qty: number, lineKey?: string) => void;
  updateAddonQty: (
    productId: number,
    addonId: string,
    qty: number,
    lineKey?: string
  ) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: (opts?: {
    taxPercent?: number;
    discount?: number;
    rounding?: number;
  }) => number;
};

function serializeAddons(addons: CartAddon[]) {
  return addons
    .slice()
    .sort((a, b) => {
      const aKey = a.variantId
        ? `${a.variantId}:${a.menuVariantItemId ?? a.id}`
        : a.menuVariantItemId ?? a.id;
      const bKey = b.variantId
        ? `${b.variantId}:${b.menuVariantItemId ?? b.id}`
        : b.menuVariantItemId ?? b.id;
      return aKey.localeCompare(bKey);
    })
    .map((a) => {
      const key = a.variantId
        ? `${a.variantId}:${a.menuVariantItemId ?? a.id}`
        : a.menuVariantItemId ?? a.id;
      return `${key}:${a.qty}`;
    })
    .join("|");
}

export function getCartLineKey(
  item: Pick<CartItem, "productId" | "addons">
) {
  return `${item.productId}:${serializeAddons(item.addons ?? [])}`;
}

function isSameLine(
  item: CartItem,
  productId: number,
  lineKey?: string
) {
  if (item.productId !== productId) return false;
  if (!lineKey) return true;
  return getCartLineKey(item) === lineKey;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  // Adds item; merges when same productId and identical addons
  addToCart: (item) =>
    set((state) => {
      const existingIndex = state.cart.findIndex((c) => {
        if (c.productId !== item.productId) return false;
        return serializeAddons(c.addons) === serializeAddons(item.addons);
      });

      if (existingIndex >= 0) {
        const newCart = state.cart.slice();
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          qty: newCart[existingIndex].qty + (item.qty || 1),
        };
        return { cart: newCart };
      }

      return { cart: [...state.cart, { ...item, qty: item.qty || 1 }] };
    }),

  removeFromCart: (productId, lineKey) =>
    set((state) => {
      if (!lineKey) {
        const index = state.cart.findIndex(
          (item) => item.productId === productId
        );
        if (index < 0) return { cart: state.cart };
        const next = state.cart.slice();
        next.splice(index, 1);
        return { cart: next };
      }

      return {
        cart: state.cart.filter(
          (item) => !isSameLine(item, productId, lineKey)
        ),
      };
    }),

  updateItemQty: (productId, qty, lineKey) =>
    set((state) => {
      let updated = false;
      const next = state.cart.map((item) => {
        if (updated || !isSameLine(item, productId, lineKey)) return item;
        updated = true;
        return { ...item, qty };
      });
      return { cart: next };
    }),

  updateAddonQty: (productId, addonId, qty, lineKey) =>
    set((state) => {
      let updated = false;
      const next = state.cart.map((item) => {
        if (updated || !isSameLine(item, productId, lineKey)) return item;
        updated = true;
        const newAddons = item.addons
          .map((addon) => (addon.id === addonId ? { ...addon, qty } : addon))
          .filter((addon) => addon.qty > 0);
        return { ...item, addons: newAddons };
      });
      return { cart: next };
    }),

  clearCart: () => set({ cart: [] }),

  getSubtotal: () =>
    get().cart.reduce((sum, item) => {
      const addonsTotal = (item.addons || []).reduce(
        (s, a) => s + a.price * a.qty,
        0
      );
      const itemTotal = (item.price + addonsTotal) * (item.qty || 1);
      return sum + itemTotal;
    }, 0),

  getTotal: (opts) => {
    const { taxPercent = 0, discount = 0, rounding = 0 } = opts || {};
    const subtotal = get().getSubtotal();
    const tax = Math.round((subtotal * taxPercent) / 100);
    return subtotal + tax - discount + rounding;
  },
}));
