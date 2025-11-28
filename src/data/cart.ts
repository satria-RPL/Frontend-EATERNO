// src/data/cart.ts
import { create } from "zustand";

export type CartAddon = {
  id: string;
  name: string;
  price: number;
  qty: number;
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
  removeFromCart: (productId: number) => void;
  updateItemQty: (productId: number, qty: number) => void;
  updateAddonQty: (productId: number, addonId: string, qty: number) => void;
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
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((a) => `${a.id}:${a.qty}`)
    .join("|");
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

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.productId !== productId),
    })),

  updateItemQty: (productId, qty) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c.productId === productId ? { ...c, qty } : c
      ),
    })),

  updateAddonQty: (productId, addonId, qty) =>
    set((state) => ({
      cart: state.cart.map((c) => {
        if (c.productId !== productId) return c;
        const newAddons = c.addons
          .map((a) => (a.id === addonId ? { ...a, qty } : a))
          .filter((a) => a.qty > 0);
        return { ...c, addons: newAddons };
      }),
    })),

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
