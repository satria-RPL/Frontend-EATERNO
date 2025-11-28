// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session/authSession";

export async function POST() {
  // hapus cookie/session
  await clearSessionCookie();

  return NextResponse.json({ success: true });
}
