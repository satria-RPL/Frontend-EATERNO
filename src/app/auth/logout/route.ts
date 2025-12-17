import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session/authSession";

export async function POST() {
  await clearSessionCookie();

  return NextResponse.json({ success: true });
}
