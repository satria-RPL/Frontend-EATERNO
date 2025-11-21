"use client";

import { useState, useRef } from "react";

import useHorizontalScroll from "@/lib/hooks/useHorizontalScroll";

import { FILTERS, ORDERS, type OrderFilter } from "@/data/orders";
import { categories, products } from "@/data/products";

import AddOnsModal from "@/components/modals/AddOnsModal";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { OrderCards } from "@/components/products/OrderCards";
import { ProductCategories } from "@/components/products/ProductCategories";
import { ProductsGrid } from "@/components/products/ProductsGrid";

type CategoryId = (typeof categories)[number]["id"];
type ProductItem = (typeof products)[number];

export default function ProductList() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [isAddOnsOpen, setIsAddOnsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );

  const filteredOrders =
    activeFilter === "all"
      ? ORDERS
      : ORDERS.filter((order) => order.type === activeFilter);

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
          orders={ORDERS}
          onChangeFilter={(value) => setActiveFilter(value)}
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
