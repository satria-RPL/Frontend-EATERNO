"use client";

import { useEffect, useMemo, useState } from "react";

import { useCartStore } from "@/data/cart";
import {
  fetchMenuVariantItems,
  fetchMenuVariants,
} from "@/lib/services/menuVariantService";

type AddOnsModalProps = {
  open: boolean;
  onClose: () => void;
  product?: {
    price: number;
    id: number;
    name: string;
    category?: string;
  } | null;
};

type MenuVariantApiItem = {
  id?: number | string;
  menuId?: number | string;
  menu_id?: number | string;
  name?: string;
};

type MenuVariantItemApiItem = {
  id?: number | string;
  menuVariantId?: number | string;
  menu_variant_id?: number | string;
  name?: string;
  additionalPrice?: number | string;
  additional_price?: number | string;
  price?: number | string;
};

type VariantItem = {
  id: string;
  variantId: string;
  name: string;
  price: number;
};

type VariantGroup = {
  id: string;
  name: string;
  items: VariantItem[];
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const candidates = [record.data, record.items, record.results, record.rows];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
    }
  }

  return [];
}

export default function AddOnsModal({
  open,
  onClose,
  product,
}: AddOnsModalProps) {
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [selectedAddonsMap, setSelectedAddonsMap] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAddonsMap({});

    if (!open || !product) {
      setVariantGroups([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      const [variantsRes, itemsRes] = await Promise.all([
        fetchMenuVariants(),
        fetchMenuVariantItems(),
      ]);

      if (cancelled) return;

      if (!variantsRes.ok || !itemsRes.ok) {
        setVariantGroups([]);
        setLoadError("Gagal memuat varian.");
        setIsLoading(false);
        return;
      }

      const variantsRaw = unwrapArray<MenuVariantApiItem>(variantsRes.data);
      const itemsRaw = unwrapArray<MenuVariantItemApiItem>(itemsRes.data);

      const normalizedVariants = variantsRaw
        .map((variant) => {
          const id = toNumber(variant.id);
          const menuId = toNumber(variant.menuId ?? variant.menu_id);
          const name =
            typeof variant.name === "string" ? variant.name.trim() : "";
          if (id == null || menuId == null || !name) return null;
          return { id: String(id), menuId, name };
        })
        .filter(
          (variant): variant is { id: string; menuId: number; name: string } =>
            Boolean(variant)
        )
        .filter((variant) => variant.menuId === product.id);

      const normalizedItems = itemsRaw
        .map((item) => {
          const id = toNumber(item.id);
          const variantId = toNumber(
            item.menuVariantId ?? item.menu_variant_id
          );
          const name = typeof item.name === "string" ? item.name.trim() : "";
          if (id == null || variantId == null || !name) return null;
          const price =
            toNumber(
              item.additionalPrice ?? item.additional_price ?? item.price
            ) ?? 0;
          return { id: String(id), variantId: String(variantId), name, price };
        })
        .filter((item): item is VariantItem => Boolean(item));

      const itemsByVariant = new Map<string, VariantItem[]>();
      normalizedItems.forEach((item) => {
        const list = itemsByVariant.get(item.variantId);
        if (list) {
          list.push(item);
        } else {
          itemsByVariant.set(item.variantId, [item]);
        }
      });

      const groups = normalizedVariants
        .map((variant) => ({
          id: variant.id,
          name: variant.name,
          items: itemsByVariant.get(variant.id) ?? [],
        }))
        .filter((group) => group.items.length > 0);

      setVariantGroups(groups);
      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [product, open]);

  const itemsById = useMemo(() => {
    const map = new Map<string, VariantItem>();
    variantGroups.forEach((group) => {
      group.items.forEach((item) => map.set(item.id, item));
    });
    return map;
  }, [variantGroups]);

  const total = useMemo(() => {
    return Object.entries(selectedAddonsMap).reduce((sum, [id, qty]) => {
      const addon = itemsById.get(id);
      return sum + (addon ? addon.price * qty : 0);
    }, 0);
  }, [selectedAddonsMap, itemsById]);

  const increment = (id: string) => {
    setSelectedAddonsMap((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const decrement = (id: string) => {
    setSelectedAddonsMap((prev) => {
      const cur = prev[id] ?? 0;
      if (cur <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: cur - 1 };
    });
  };

  const addToCart = useCartStore((s) => s.addToCart);

  const handleAdd = () => {
    if (!product) return;

    const formattedAddons = Object.entries(selectedAddonsMap)
      .map(([id, qty]) => {
        const addon = itemsById.get(id);
        if (!addon) return null;
        return {
          id: addon.id,
          name: addon.name,
          price: addon.price,
          qty,
          variantId: addon.variantId,
          menuVariantItemId: addon.id,
        };
      })
      .filter(
        (
          addon
        ): addon is {
          id: string;
          name: string;
          price: number;
          qty: number;
          variantId: string;
          menuVariantItemId: string;
        } => Boolean(addon)
      );

    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price ?? 0,
      qty: 1,
      addons: formattedAddons,
    });

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[640px] max-w-[95vw] h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-none bg-white z-10">
          <h1 className="text-xl font-semibold">
            Add - Ons {product ? `— ${product.name}` : ""}
          </h1>
          <button
            onClick={onClose}
            className="text-red-500 text-lg font-semibold"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 hide-scrollbar">
          {isLoading && (
            <div className="text-sm text-gray-500">Loading addons...</div>
          )}

          {!isLoading && loadError && (
            <div className="text-sm text-red-500">{loadError}</div>
          )}

          {!isLoading && !loadError && variantGroups.length === 0 && (
            <div className="text-sm text-gray-500">No addons available.</div>
          )}

          {variantGroups.map((group) => (
            <section key={group.id} className="mb-6">
              <h2 className="text-lg font-medium mb-3">{group.name}</h2>
              <div className="space-y-3">
                {group.items.map((a) => {
                  const idStr = String(a.id);
                  const qty = selectedAddonsMap[idStr] ?? 0;
                  return (
                    <div
                      key={idStr}
                      className="flex items-center justify-between gap-4 rounded p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-sm shrink-0" />
                        <div>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-sm text-orange-600 mt-1">
                            {a.price > 0
                              ? `Rp ${a.price.toLocaleString("id-ID")}`
                              : "Gratis"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrement(idStr)}
                          className="w-8 h-8 bg-red-500 text-white rounded-md flex items-center justify-center"
                          aria-label={`decrease ${a.name}`}
                        >
                          −
                        </button>
                        <div className="min-w-7 text-center">{qty}</div>
                        <button
                          onClick={() => increment(idStr)}
                          className="w-8 h-8 bg-orange-500 text-white rounded-md flex items-center justify-center"
                          aria-label={`increase ${a.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex-none bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Total Add - Ons</div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-orange-500 text-white rounded-md"
              >
                {total > 0 ? `Rp ${total.toLocaleString("id-ID")}` : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
