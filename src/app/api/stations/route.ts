import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await apiRequest("/api/stations", { auth: true });
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
  };

  if (!result.ok) {
    return NextResponse.json(
      {
        message: result.error,
        data: result.data ?? null,
      },
      { status: result.status, headers }
    );
  }

  return NextResponse.json(result.data, { status: result.status, headers });
}
