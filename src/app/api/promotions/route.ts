import { NextResponse } from "next/server";
import { apiRequest } from "@/lib/api";

export async function GET() {
  try {
    const [promotionsRes, rulesRes] = await Promise.all([
      apiRequest("/api/promotions", { auth: true }),
      apiRequest("/api/promotion-rules", { auth: true }),
    ]);

    if (!promotionsRes.ok) {
      return NextResponse.json(
        { message: promotionsRes.error ?? "Gagal mengambil data promotion" },
        { status: promotionsRes.status }
      );
    }
    if (!rulesRes.ok) {
      return NextResponse.json(
        { message: rulesRes.error ?? "Gagal mengambil data promotion rules" },
        { status: rulesRes.status }
      );
    }

    return NextResponse.json({
      promotions: promotionsRes.data,
      rules: rulesRes.data,
    });
  } catch (err) {
    console.error("PROMOTION API ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
