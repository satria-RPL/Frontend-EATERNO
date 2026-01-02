import { NextResponse } from "next/server";
import { getAuthTokenFromCookie } from "@/lib/session/authSession";

const BACKEND_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:3000";

export async function GET() {
  try {
    const session = await getAuthTokenFromCookie();

    if (!session?.token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(`${BACKEND_BASE_URL}/api/tables`, {
      headers: {
        Accept: "application/json",
        Authorization: `${session.tokenType ?? "Bearer"} ${session.token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return NextResponse.json(
        { message: err?.message ?? "Gagal mengambil data tables" },
        { status: res.status }
      );
    }

    const tables = await res.json();

    return NextResponse.json(tables);
  } catch (error) {
    console.error("TABLES API ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
