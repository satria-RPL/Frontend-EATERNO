"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import useHorizontalScroll from "@/lib/hooks/useHorizontalScroll";
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

export default function ProductsListClient({
  products,
  categories,
}: ProductsListClientProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isAddOnsOpen, setIsAddOnsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );

  const handleBackOrderType = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("eaterno-checkout");
    }
    router.push("/main/products/ordertype");
  };

  const { loadKitchenOrders } = useMemo(
    // () => createKitchenOrdersLoader({ fetchKitchenOrders }),
    () => createKitchenOrdersLoader({ fetchKitchenOrders, splitByItem: false }),
    []
  );

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      const result = await loadKitchenOrders();
      if (!isActive) return;

      if (result.error) {
        console.error("Failed to load kitchen orders", result.error);
        setOrders([]);
        return;
      }

      setOrders(result.orders);
    };

    loadOrders();
    const intervalId = window.setInterval(loadOrders, 15000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [loadKitchenOrders]);

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

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useHorizontalScroll(scrollRef);

  const handleAddToCart = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsAddOnsOpen(true);
  };

  return (
    <>
      <div className="mb-10">
        <ProductsHeader
          activeFilter={activeFilter}
          filters={FILTERS}
          orders={visibleOrders}
          onChangeFilter={(value) => setActiveFilter(value)}
          onBack={handleBackOrderType}
        />

        <OrderCards orders={filteredOrders} scrollRef={scrollRef} />

        <ProductCategories
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(id) => setActiveCategory(id)}
        />

        <ProductsGrid
          products={filteredProducts}
          onAddToCart={handleAddToCart}
        />
      </div>

      <AddOnsModal
        open={isAddOnsOpen}
        onClose={() => setIsAddOnsOpen(false)}
        product={selectedProduct}
      />
    </>
  );
}
