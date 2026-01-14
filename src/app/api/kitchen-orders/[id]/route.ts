import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({}));
  const body =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  const result = await apiRequest(`/api/kitchen-orders/${id}`, {
    auth: true,
    method: "PUT",
    body: JSON.stringify(body),
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
