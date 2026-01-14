import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = context.params;
  const payload = await request.json().catch(() => ({}));

  const result = await apiRequest(`/api/transactions/${id}`, {
    auth: true,
    method: "PUT",
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

  return NextResponse.json(result.data, { status: result.status });
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = context.params;
  const result = await apiRequest(`/api/transactions/${id}`, { auth: true });

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
