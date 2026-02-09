import { apiRequest } from "@/lib/api";

export function fetchMenus() {
  return apiRequest("/api/menus", { auth: true });
}

export function fetchMenuPrices() {
  return apiRequest("/api/menu-prices", { auth: true });
}

export function fetchCategories(type?: string) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  return apiRequest(`/api/categories${query}`, { auth: true });
}
