import type { OrderStatus } from "@/types/order";

export function normalizeStatus(value: unknown): OrderStatus {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return "proses";

  if (
    normalized === "proses" ||
    normalized === "processing" ||
    normalized === "process" ||
    normalized === "pending" ||
    normalized === "queued"
  ) {
    return "proses";
  }

  if (normalized === "cancel" || normalized === "cancelled" || normalized === "canceled") {
    return "cancel";
  }

  if (
    normalized === "ready_to_pickup" ||
    normalized === "ready-to-pickup" ||
    normalized === "readytopickup" ||
    normalized === "ready"
  ) {
    return "ready_to_pickup";
  }

  if (
    normalized === "selesai" ||
    normalized === "done" ||
    normalized === "finished" ||
    normalized === "completed" ||
    normalized === "paid" ||
    normalized === "settled"
  ) {
    return "selesai";
  }

  return "proses";
}
