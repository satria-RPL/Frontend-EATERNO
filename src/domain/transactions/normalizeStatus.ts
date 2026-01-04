import type { OrderStatus } from "@/types/order";

export function normalizeStatus(value: unknown): OrderStatus {
  if (value === "proses" || value === "cancel" || value === "selesai") {
    return value;
  }
  if (value === "done" || value === "finished" || value === "completed") {
    return "selesai";
  }
  if (value === "cancelled" || value === "canceled") {
    return "cancel";
  }
  if (value === "processing" || value === "process" || value === "pending") {
    return "proses";
  }
  return "proses";
}
