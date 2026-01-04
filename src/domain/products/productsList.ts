type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

type MenuApiItem = {
  id: number;
  placeId?: number;
  place_id?: number;
  name: string;
  categoryId?: number | string;
  category_id?: number | string;
  description?: string;
  sku?: string;
  isActive?: boolean | number | string;
  is_active?: boolean | number | string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
};

type MenuPriceApiItem = {
  id?: number;
  menuId?: number | string;
  menu_id?: number | string;
  menu?: { id?: number | string };
  price?: number | string;
  sellPrice?: number | string;
  sellingPrice?: number | string;
  amount?: number | string;
  effectiveDate?: string;
  effective_date?: string;
};

type CategoryApiItem = {
  id?: number | string;
  categoryId?: number | string;
  category_id?: number | string;
  name?: string;
  label?: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  isActive?: boolean | number | string;
  is_active?: boolean | number | string;
};

export type ProductItem = {
  id: number;
  name: string;
  available: number;
  price: number;
  image: string;
  category: string;
};

export type ProductCategory = {
  id: string;
  label: string;
  icon: string;
};

export type ProductsListService = {
  fetchMenus: () => Promise<ApiResult>;
  fetchMenuPrices: () => Promise<ApiResult>;
  fetchCategories: () => Promise<ApiResult>;
};

const DEFAULT_AVAILABLE = 10;
const FALLBACK_IMAGE = "/img/coffee.jpg";
const FALLBACK_CATEGORY: ProductCategory = {
  id: "all",
  label: "All Menu",
  icon: "/icon/forkandspoon.png",
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  beverages: "/icon/coffee.png",
  beverage: "/icon/coffee.png",
  drink: "/icon/coffee.png",
  drinks: "/icon/coffee.png",
  food: "/icon/ricebowl.png",
  rice: "/icon/ricebowl.png",
  ricebowl: "/icon/ricebowl.png",
  tea: "/icon/teapot.png",
  juice: "/icon/juice.png",
  pasta: "/icon/pasta.webp",
};

function resolveCategoryIcon(label: string | null, fallback: string) {
  if (!label) return fallback;
  const normalized = label.trim().toLowerCase();
  if (!normalized) return fallback;
  return CATEGORY_ICON_MAP[normalized] ?? fallback;
}

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

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }
  return null;
}

function toTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.data,
    record.items,
    record.results,
    record.result,
    record.rows,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
    }
  }

  return [];
}

function shouldReplacePrice(
  currentDate: number | null,
  nextDate: number | null
) {
  if (currentDate == null && nextDate == null) return true;
  if (currentDate == null) return true;
  if (nextDate == null) return false;
  return nextDate >= currentDate;
}

function buildPriceMap(prices: MenuPriceApiItem[]) {
  const map = new Map<number, { price: number; effectiveDate: number | null }>();

  prices.forEach((item) => {
    const rawMenuId = item.menuId ?? item.menu_id ?? item.menu?.id;
    const rawPrice =
      item.price ?? item.sellPrice ?? item.sellingPrice ?? item.amount;

    const menuId = toNumber(rawMenuId);
    const price = toNumber(rawPrice);

    if (menuId == null || price == null) return;

    const effectiveDate = toTimestamp(item.effectiveDate ?? item.effective_date);
    const existing = map.get(menuId);

    if (!existing || shouldReplacePrice(existing.effectiveDate, effectiveDate)) {
      map.set(menuId, { price, effectiveDate });
    }
  });

  const result = new Map<number, number>();
  map.forEach((value, key) => result.set(key, value.price));
  return result;
}

function buildProducts(
  menus: MenuApiItem[],
  priceMap: Map<number, number>
): ProductItem[] {
  return menus
    .filter((menu) => {
      const activeValue = normalizeBoolean(menu.isActive ?? menu.is_active);
      return activeValue ?? true;
    })
    .map((menu) => {
      const categoryId = toNumber(menu.categoryId ?? menu.category_id);
      return {
        id: menu.id,
        name: menu.name,
        price: priceMap.get(menu.id) ?? 0,
        available: DEFAULT_AVAILABLE,
        image: menu.image ?? menu.imageUrl ?? menu.image_url ?? FALLBACK_IMAGE,
        category: categoryId != null ? String(categoryId) : "other",
      };
    });
}

function buildCategoriesFromMenus(menus: MenuApiItem[]): ProductCategory[] {
  const categoryIds = Array.from(
    new Set(
      menus
        .map((menu) => toNumber(menu.categoryId ?? menu.category_id))
        .filter((id): id is number => id != null)
    )
  ).sort((a, b) => a - b);

  const categories = categoryIds.map((id) => ({
    id: String(id),
    label: `Kategori ${id}`,
    icon: "/icon/forkandspoon.png",
  }));

  if (categories.length === 0) {
    return [FALLBACK_CATEGORY];
  }

  return [FALLBACK_CATEGORY, ...categories];
}

function buildCategoriesFromEndpoint(
  items: CategoryApiItem[]
): ProductCategory[] | null {
  const mapped = items
    .map((item) => {
      const activeValue = normalizeBoolean(item.isActive ?? item.is_active);
      if (activeValue === false) return null;

      const categoryId = toNumber(item.id ?? item.categoryId ?? item.category_id);
      if (categoryId == null) return null;

      const labelSource =
        (typeof item.label === "string" && item.label.trim() ? item.label : null) ??
        (typeof item.name === "string" && item.name.trim() ? item.name : null) ??
        (typeof item.title === "string" && item.title.trim() ? item.title : null) ??
        (typeof item.description === "string" && item.description.trim()
          ? item.description
          : null);

      const icon =
        item.icon ??
        item.image ??
        item.imageUrl ??
        item.image_url ??
        "/icon/forkandspoon.png";

      const resolvedIcon = resolveCategoryIcon(labelSource, icon);

      return {
        id: String(categoryId),
        label: labelSource ?? `Kategori ${categoryId}`,
        icon: resolvedIcon,
      };
    })
    .filter((category): category is ProductCategory => Boolean(category));

  if (mapped.length === 0) return null;

  const seen = new Set<string>();
  const deduped = mapped.filter((category) => {
    if (seen.has(category.id)) return false;
    seen.add(category.id);
    return true;
  });

  return [FALLBACK_CATEGORY, ...deduped];
}

export function createProductsListLoader({
  fetchMenus,
  fetchMenuPrices,
  fetchCategories,
}: ProductsListService) {
  async function loadProductsList(): Promise<{
    products: ProductItem[];
    categories: ProductCategory[];
  }> {
    const [menusResult, pricesResult, categoriesResult] = await Promise.all([
      fetchMenus(),
      fetchMenuPrices(),
      fetchCategories(),
    ]);

    const menus = menusResult.ok
      ? unwrapArray<MenuApiItem>(menusResult.data)
      : [];

    const prices = pricesResult.ok
      ? unwrapArray<MenuPriceApiItem>(pricesResult.data)
      : [];

    const categoriesRaw = categoriesResult.ok
      ? unwrapArray<CategoryApiItem>(categoriesResult.data)
      : [];

    const priceMap = buildPriceMap(prices);
    const products = buildProducts(menus, priceMap);
    const categories =
      buildCategoriesFromEndpoint(categoriesRaw) ?? buildCategoriesFromMenus(menus);

    return { products, categories };
  }

  return { loadProductsList };
}
