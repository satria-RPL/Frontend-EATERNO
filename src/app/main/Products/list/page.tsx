import ProductsListClient from "./ProductsListClient";
import { createProductsListLoader } from "@/domain/products/productsList";
import {
  fetchCategories,
  fetchMenuPrices,
  fetchMenus,
} from "@/lib/services/menuService";

const { loadProductsList } = createProductsListLoader({
  fetchMenus,
  fetchMenuPrices,
  fetchCategories,
});

export default async function ProductList() {
  const { products, categories } = await loadProductsList();

  return <ProductsListClient products={products} categories={categories} />;
}
