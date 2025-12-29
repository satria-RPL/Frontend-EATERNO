import { Table } from "@/types/table";

const BASE_URL = process.env.API_BASE_URL;

/**
 * Helper fetch standar
 * TIDAK mengubah data backend
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}` ← jika backend butuh
    },
    ...options,
  });

  if (!res.ok) {
    let errorMessage = "Terjadi kesalahan server";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  // DELETE (204) tidak punya body
  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}

/* ================= API TABLES ================= */

export const TablesService = {
  /** GET /api/tables */
  getAll(): Promise<Table[]> {
    return request<Table[]>("/api/tables");
  },

  /** GET /api/tables/{id} */
  getById(id: number): Promise<Table> {
    return request<Table>(`/api/tables/${id}`);
  },

  /** POST /api/tables */
  create(payload: {
    placeId: number;
    name: string;
    status: "available" | "occupied";
  }): Promise<Table> {
    return request<Table>("/api/tables", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** PUT /api/tables/{id} */
  update(
    id: number,
    payload: Partial<{
      placeId: number;
      name: string;
      status: "available" | "occupied";
    }>
  ): Promise<Table> {
    return request<Table>(`/api/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /** DELETE /api/tables/{id} */
  remove(id: number): Promise<void> {
    return request<void>(`/api/tables/${id}`, {
      method: "DELETE",
    });
  },
};
