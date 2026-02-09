"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useHorizontalScroll from "@/lib/hooks/useHorizontalScroll";
import { usePolling } from "@/lib/hooks/usePolling";
import { FILTERS, type OrderFilter, type OrderSummary } from "@/data/orders";
import type {
  ProductCategory,
  ProductItem,
} from "@/domain/products/productsList";
import { createKitchenOrdersLoader } from "@/domain/kitchenOrders";
import { fetchKitchenOrders } from "@/lib/services/kitchenOrderService";

import AddOnsModal from "@/components/modals/AddOnsModal";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { OrderCards } from "@/components/products/OrderCards";
import { ProductCategories } from "@/components/products/ProductCategories";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { useRouter } from "next/navigation";

type ProductsListClientProps = {
  products: ProductItem[];
  categories: ProductCategory[];
};

type OrdersSectionProps = {
  onBack: () => void;
};

function buildOrdersFingerprint(orders: OrderSummary[]) {
  return orders
    .map(
      (order) =>
        `${order.id}:${order.transactionStatus ?? ""}:${order.kitchenStatus ?? ""}:${order.timeAgo ?? ""}:${order.itemsCount}:${order.type}`
    )
    .join("|");
}

function OrdersSection({ onBack }: OrdersSectionProps) {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fingerprintRef = useRef<string>("");

  useHorizontalScroll(scrollRef);

  const { loadKitchenOrders } = useMemo(
    () => createKitchenOrdersLoader({ fetchKitchenOrders, splitByItem: false }),
    []
  );

  const applyOrders = useCallback((nextOrders: OrderSummary[]) => {
    const nextFingerprint = buildOrdersFingerprint(nextOrders);
    if (nextFingerprint === fingerprintRef.current) return;
    fingerprintRef.current = nextFingerprint;
    setOrders(nextOrders);
  }, []);

  const loadOrders = useCallback(async () => {
    const result = await loadKitchenOrders();
    if (result.error) {
      console.error("Failed to load kitchen orders", result.error);
      applyOrders([]);
      return;
    }
    applyOrders(result.orders);
  }, [loadKitchenOrders, applyOrders]);

  usePolling(loadOrders, { intervalMs: 15000, immediate: true });

  const visibleOrders = useMemo(() => {
    const allowedStatuses = new Set(["proses", "process", "ready_to_pickup"]);

    const getPriority = (status: string) => {
      if (status === "ready_to_pickup") return 0;
      return 1;
    };

    return orders
      .map((order, index) => ({ order, index }))
      .filter(({ order }) => {
        const rawStatus = order.transactionStatus ?? "proses";
        const normalized = rawStatus.toLowerCase().replace(/\s+/g, "_");
        return allowedStatuses.has(normalized);
      })
      .sort((a, b) => {
        const statusA = (a.order.transactionStatus ?? "proses")
          .toLowerCase()
          .replace(/\s+/g, "_");
        const statusB = (b.order.transactionStatus ?? "proses")
          .toLowerCase()
          .replace(/\s+/g, "_");
        const diff = getPriority(statusA) - getPriority(statusB);
        if (diff !== 0) return diff;
        return a.index - b.index;
      })
      .map(({ order }) => order);
  }, [orders]);

  const filteredOrders =
    activeFilter === "all"
      ? visibleOrders
      : visibleOrders.filter((order) => order.type === activeFilter);

  return (
    <>
      <ProductsHeader
        activeFilter={activeFilter}
        filters={FILTERS}
        orders={visibleOrders}
        onChangeFilter={(value) => setActiveFilter(value)}
        onBack={onBack}
      />

      <OrderCards orders={filteredOrders} scrollRef={scrollRef} />
    </>
  );
}

export default function ProductsListClient({
  products,
  categories,
}: ProductsListClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAddOnsOpen, setIsAddOnsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handleBackOrderType = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("eaterno-checkout");
    }
    router.push("/main/products/ordertype");
  }, [router]);

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((product) => product.category === activeCategory),
    [activeCategory, products]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory]);

  const pagedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );
  const canLoadMore = visibleCount < filteredProducts.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + PAGE_SIZE, filteredProducts.length)
    );
  }, [filteredProducts.length]);

  const handleSelectCategory = useCallback((id: string) => {
    setActiveCategory(id);
  }, []);

  const handleAddToCart = useCallback((product: ProductItem) => {
    setSelectedProduct(product);
    setIsAddOnsOpen(true);
  }, []);

  return (
    <>
      <div className="mb-10">
        <OrdersSection onBack={handleBackOrderType} />

        <ProductCategories
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        <ProductsGrid
          products={pagedProducts}
          onAddToCart={handleAddToCart}
        />

        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>
            Menampilkan {Math.min(visibleCount, filteredProducts.length)} dari{" "}
            {filteredProducts.length} menu
          </span>
          {canLoadMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              className="rounded-full border border-orange-200 px-4 py-2 text-orange-600 transition hover:bg-orange-50"
            >
              Load more
            </button>
          )}
        </div>
      </div>

      <AddOnsModal
        open={isAddOnsOpen}
        onClose={() => setIsAddOnsOpen(false)}
        product={selectedProduct}
      />
    </>
  );
}
