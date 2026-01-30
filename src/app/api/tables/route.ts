import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export async function GET() {
  try {
    const result = await apiRequest("/api/tables", { auth: true });

    if (!result.ok) {
      return NextResponse.json(
        { message: result.error ?? "Gagal mengambil data tables" },
        { status: result.status }
      );
    }

    const tables = result.data;
    const normalized = Array.isArray(tables)
      ? tables.map((table) => normalizeTableRecord(table))
      : tables;

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("TABLES API ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function normalizeTableStatus(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "available" ? "available" : "not_available";
}

function normalizeTableRecord(table: unknown) {
  if (!table || typeof table !== "object") return table;
  const record = table as Record<string, unknown>;
  const placeId =
    record.placeId ?? record.place_id ?? record.placeID ?? record.placeID;

  return {
    ...record,
    placeId: placeId ?? null,
    status: normalizeTableStatus(record.status ?? null),
  };
}
