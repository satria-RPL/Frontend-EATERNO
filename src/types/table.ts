export type TableStatus = "available" | "occupied";

export interface Table {
  id: number;
  placeId: number;
  name: string;
  status: TableStatus;

  // future backend
  // capacity?: number;
}
