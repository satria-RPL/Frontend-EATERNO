import { apiRequest } from "@/lib/api";

export function fetchMenus() {
  return apiRequest("/api/menus", { auth: true });
}

export function fetchMenuPrices() {
  return apiRequest("/api/menu-prices", { auth: true });
}

export function fetchCategories() {
  return apiRequest("/api/categories", { auth: true });
}
