import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await apiRequest(`/api/tables/${id}`, { auth: true });

  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.error,
        data: result.data ?? null,
      },
      { status: result.status }
    );
  }

  const data = normalizeTablePayload(result.data);
  return NextResponse.json(data, { status: result.status });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({}));
  const normalizedPayload = normalizeTableUpdatePayload(payload);

  const result = await apiRequest(`/api/tables/${id}`, {
    auth: true,
    method: "PUT",
    body: JSON.stringify(normalizedPayload),
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

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const init: RequestInit = {
    method: "DELETE",
  };

  if (payload && typeof payload === "object") {
    init.body = JSON.stringify(payload);
  }

  const result = await apiRequest(`/api/tables/${id}`, {
    auth: true,
    ...init,
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

  if (result.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = normalizeTablePayload(result.data ?? null);
  return NextResponse.json(data, { status: result.status });
}

function normalizeTableUpdatePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  const record = payload as Record<string, unknown>;
  if ("status" in record) {
    return {
      ...record,
      status: toBackendStatus(record.status),
    };
  }
  return payload;
}

function toBackendStatus(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "available" ? "available" : "occupied";
}

function normalizeTablePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  if (Array.isArray(payload)) {
    return payload.map((table: unknown) => normalizeTablePayload(table));
  }
  const record = payload as Record<string, unknown>;
  if ("status" in record) {
    return {
      ...record,
      status: normalizeTableStatus(record.status),
    };
  }
  return payload;
}

function normalizeTableStatus(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "available" ? "available" : "not_available";
}
