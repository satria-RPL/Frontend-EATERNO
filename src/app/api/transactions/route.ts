import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";
import { getAuthCookiePayload } from "@/lib/session/authSession";

export const dynamic = "force-dynamic";



export async function GET() {
  const result = await apiRequest("/api/transactions", { auth: true });

  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.error,
        data: result.data ?? null,
      },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}

export async function POST(request: Request) {
  const parsed = await request.json().catch(() => ({}));
  const payload =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};

  const authPayload = await getAuthCookiePayload();
  const cashierId =
    toNumber(payload?.cashierId) ?? toNumber(authPayload?.userId) ?? null;
  const createdAt =
    typeof payload?.createdAt === "string" && payload.createdAt.trim()
      ? payload.createdAt
      : new Date().toISOString();
  const normalizedItems = normalizeTransactionItems(payload?.items);
  const note =
    typeof payload?.note === "string" && payload.note.trim()
      ? payload.note.trim()
      : typeof payload?.kitchenNote === "string" && payload.kitchenNote.trim()
      ? payload.kitchenNote.trim()
      : null;

  const enrichedPayload = {
    ...payload,
    cashierId,
    createdAt,
    cashier_id: cashierId,
    place_id: payload?.placeId ?? payload?.place_id ?? null,
    table_id: payload?.tableId ?? payload?.table_id ?? null,
    order_type: payload?.orderType ?? payload?.order_type ?? null,
    customer_name: payload?.customerName ?? payload?.customer_name ?? null,
    total_items: payload?.totalItems ?? payload?.total_items ?? null,
    payment_method_id:
      payload?.paymentMethodId ?? payload?.payment_method_id ?? null,
    note,
    created_at: createdAt,
    items: normalizedItems.length > 0 ? normalizedItems : payload?.items,
  };

  const result = await apiRequest("/api/transactions", {
    auth: true,
    method: "POST",
    body: JSON.stringify(enrichedPayload),
  });

  if (!result.ok) {
    console.error("POST /api/transactions error:", {
      status: result.status,
      error: result.error,
      data: result.data ?? null,
    });
    return NextResponse.json(
      {
        message: result.error,
        data: result.data ?? null,
      },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeTransactionItems(items: unknown): Record<string, unknown>[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => (isRecord(item) ? item : null))
    .filter((item): item is Record<string, unknown> => item != null)
    .map((item) => {
      const menuId = item.menuId ?? item.menu_id ?? null;
      const qty = item.qty ?? item.quantity ?? null;
      const price = item.price ?? item.unitPrice ?? item.unit_price ?? null;
      const note = item.note ?? item.kitchenNote ?? null;
      const variants = normalizeVariants(item.variants);

      return {
        ...item,
        menuId,
        menu_id: menuId,
        qty,
        price,
        note,
        variants,
      };
    });
}

function normalizeVariants(variants: unknown): Record<string, unknown>[] {
  if (!Array.isArray(variants)) return [];

  return variants
    .map((variant) => (isRecord(variant) ? variant : null))
    .filter((variant): variant is Record<string, unknown> => variant != null)
    .map((variant) => {
      const menuVariantId =
        variant.menuVariantId ?? variant.menu_variant_id ?? variant.id ?? null;
      const extraPrice = variant.extraPrice ?? variant.extra_price ?? null;
      const qty = variant.qty ?? variant.quantity ?? null;

      return {
        ...variant,
        menuVariantId,
        menu_variant_id: menuVariantId,
        extraPrice,
        extra_price: extraPrice,
        qty,
      };
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
