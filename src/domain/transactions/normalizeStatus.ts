import type { OrderStatus } from "@/types/order";

export function normalizeStatus(value: unknown): OrderStatus {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (
    normalized === "proses" ||
    normalized === "cancel" ||
    normalized === "selesai" ||
    normalized === "ready_to_pickup"
  ) {
    return normalized;
  }
  if (
    normalized === "done" ||
    normalized === "finished" ||
    normalized === "completed" ||
    normalized === "ready" ||
    normalized === "ready-to-pickup" ||
    normalized === "readytopickup"
  ) {
    return "ready_to_pickup";
  }
  if (normalized === "paid" || normalized === "settled") {
    return "selesai";
  }
  if (normalized === "cancelled" || normalized === "canceled") {
    return "cancel";
  }
  if (
    normalized === "processing" ||
    normalized === "process" ||
    normalized === "pending"
  ) {
    return "proses";
  }
  return "proses";
}
