"use client";

import { useEffect, useMemo, useState } from "react";

import { useCartStore } from "@/data/cart";
import {
  createAddOnsOptionsLoader,
  type VariantGroup,
  type VariantItem,
} from "@/domain/products/addonsOptions";
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

  const { loadAddOnsOptions } = useMemo(
    () =>
      createAddOnsOptionsLoader({
        fetchMenuVariants,
        fetchMenuVariantItems,
      }),
    []
  );

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

      const result = await loadAddOnsOptions(product.id);
      if (cancelled) return;

      if (result.error) {
        setVariantGroups([]);
        setLoadError(result.error);
        setIsLoading(false);
        return;
      }

      setVariantGroups(result.groups);
      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [product, open, loadAddOnsOptions]);

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

  const selectedByVariant = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(selectedAddonsMap).forEach(([id, qty]) => {
      if (qty <= 0) return;
      const addon = itemsById.get(id);
      if (!addon) return;
      map.set(addon.variantId, id);
    });
    return map;
  }, [selectedAddonsMap, itemsById]);

  const increment = (id: string) => {
    setSelectedAddonsMap((prev) => {
      const addon = itemsById.get(id);
      if (!addon) return prev;
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const existing = itemsById.get(key);
        if (existing?.variantId === addon.variantId && key !== id) {
          delete next[key];
        }
      });
      next[id] = 1;
      return next;
    });
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
            Add - Ons {product ? `- ${product.name}` : ""}
          </h1>
          <button
            onClick={onClose}
            className="text-red-500 text-lg font-semibold"
            aria-label="close"
          >
            x
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
                  const selectedId = selectedByVariant.get(a.variantId);
                  const isBlocked = Boolean(selectedId && selectedId !== idStr);
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
                          -
                        </button>
                        <div className="min-w-7 text-center">{qty}</div>
                        <button
                          onClick={() => increment(idStr)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-white ${
                            isBlocked ? "bg-orange-300" : "bg-orange-500"
                          }`}
                          aria-label={`increase ${a.name}`}
                          disabled={isBlocked}
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
