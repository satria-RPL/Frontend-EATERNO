import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await apiRequest("/api/tables", { auth: true });

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
