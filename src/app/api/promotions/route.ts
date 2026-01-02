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

    const headers = {
      Accept: "application/json",
      Authorization: `${session.tokenType ?? "Bearer"} ${session.token}`,
    };

    const [promotionsRes, rulesRes] = await Promise.all([
      fetch(`${BACKEND_BASE_URL}/api/promotions`, { headers }),
      fetch(`${BACKEND_BASE_URL}/api/promotion-rules`, { headers }),
    ]);

    if (!promotionsRes.ok || !rulesRes.ok) {
      return NextResponse.json(
        { message: "Gagal mengambil data promotion" },
        { status: 500 }
      );
    }

    const promotions = await promotionsRes.json();
    const rules = await rulesRes.json();

    return NextResponse.json({
      promotions,
      rules,
    });
  } catch (err) {
    console.error("PROMOTION API ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
