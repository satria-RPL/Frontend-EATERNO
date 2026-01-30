export type Table = {
  id: number;
  placeId: number;
  name: string;
  status: "available" | "not_available";
  capacity: number;
};

export class TablesService {
  static async getAll(options: RequestInit = {}): Promise<Table[]> {
    const res = await fetch("/api/tables", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      ...options,
    });

    if (!res.ok) {
      throw new Error(`Failed load tables (${res.status})`);
    }

    return res.json();
  }

  static async update(
    tableId: number,
    payload: Partial<Table>
  ): Promise<Table> {
    const res = await fetch(`/api/tables/${tableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed update table (${res.status})`);
    }

    return res.json();
  }
}
