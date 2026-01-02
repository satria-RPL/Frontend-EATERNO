export type Table = {
  id: number;
  placeId: number;
  name: string;
  status: "available" | "occupied";
  capacity: number;
};

export class TablesService {
  static async getAll(): Promise<Table[]> {
    const res = await fetch("/api/tables", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed load tables (${res.status})`);
    }

    return res.json();
  }
}
