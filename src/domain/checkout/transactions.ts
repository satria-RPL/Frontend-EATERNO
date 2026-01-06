export type CartAddonInput = {
  variantId?: string | number | null;
  price?: number | null;
  qty?: number | null;
};

export type CartItemInput = {
  productId: number;
  qty?: number | null;
  price?: number | null;
  addons?: CartAddonInput[] | null;
};

export function buildTransactionItems(items: CartItemInput[]) {
  return items.map((item) => ({
    menuId: item.productId,
    qty: item.qty ?? 0,
    price: item.price ?? 0,
    variants: (item.addons ?? []).map((addon) => ({
      menuVariantId: addon.variantId ?? null,
      extraPrice: addon.price ?? 0,
      qty: addon.qty ?? 0,
    })),
  }));
}

export function resolveOrderType(value: string | null, tableId: number | null) {
  if (value) {
    const normalized = value.toLowerCase().replace(/[\s_-]/g, "");
    if (normalized === "dinein") return "dine_in";
    if (normalized === "takeaway" || normalized === "takeout")
      return "takeaway";
  }
  return tableId ? "dine_in" : "takeaway";
}
