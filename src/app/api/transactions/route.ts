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
  const payload = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const authPayload = await getAuthCookiePayload();
  const cashierId =
    toNumber(payload?.cashierId) ?? toNumber(authPayload?.userId) ?? null;
  const createdAt =
    typeof payload?.createdAt === "string" && payload.createdAt.trim()
      ? payload.createdAt
      : new Date().toISOString();

  const enrichedPayload = {
    ...payload,
    cashierId,
    createdAt,
  };

  const result = await apiRequest("/api/transactions", {
    auth: true,
    method: "POST",
    body: JSON.stringify(enrichedPayload),
  });

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
