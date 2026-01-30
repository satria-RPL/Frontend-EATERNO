import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({}));

  const result = await apiRequest(`/api/transactions/void/${id}`, {
    auth: true,
    method: "POST",
    body: JSON.stringify(payload),
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

  return NextResponse.json(result.data ?? null, { status: result.status });
}
