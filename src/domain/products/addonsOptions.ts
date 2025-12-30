type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

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

export type VariantItem = {
  id: string;
  variantId: string;
  name: string;
  price: number;
};

export type VariantGroup = {
  id: string;
  name: string;
  items: VariantItem[];
};

export type AddOnsOptionsService = {
  fetchMenuVariants: () => Promise<ApiResult>;
  fetchMenuVariantItems: () => Promise<ApiResult>;
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

export function createAddOnsOptionsLoader({
  fetchMenuVariants,
  fetchMenuVariantItems,
}: AddOnsOptionsService) {
  async function loadAddOnsOptions(menuId: number): Promise<{
    groups: VariantGroup[];
    error: string | null;
  }> {
    if (!Number.isFinite(menuId) || menuId <= 0) {
      return { groups: [], error: "Menu tidak valid" };
    }

    const [variantsRes, itemsRes] = await Promise.all([
      fetchMenuVariants(),
      fetchMenuVariantItems(),
    ]);

    if (!variantsRes.ok || !itemsRes.ok) {
      return { groups: [], error: "Gagal memuat varian." };
    }

    const variantsRaw = unwrapArray<MenuVariantApiItem>(variantsRes.data);
    const itemsRaw = unwrapArray<MenuVariantItemApiItem>(itemsRes.data);

    const normalizedVariants = variantsRaw
      .map((variant) => {
        const id = toNumber(variant.id);
        const rawMenuId = toNumber(variant.menuId ?? variant.menu_id);
        const name =
          typeof variant.name === "string" ? variant.name.trim() : "";
        if (id == null || rawMenuId == null || !name) return null;
        return { id: String(id), menuId: rawMenuId, name };
      })
      .filter(
        (variant): variant is { id: string; menuId: number; name: string } =>
          Boolean(variant)
      )
      .filter((variant) => variant.menuId === menuId);

    const normalizedItems = itemsRaw
      .map((item) => {
        const id = toNumber(item.id);
        const variantId = toNumber(item.menuVariantId ?? item.menu_variant_id);
        const name = typeof item.name === "string" ? item.name.trim() : "";
        if (id == null || variantId == null || !name) return null;
        const price =
          toNumber(item.additionalPrice ?? item.additional_price ?? item.price) ??
          0;
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

    return { groups, error: null };
  }

  return { loadAddOnsOptions };
}
