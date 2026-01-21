import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAuthTokenFromCookie } from "@/lib/session/authSession";

const STORAGE_DIR = path.join(process.cwd(), ".data");
const STORAGE_FILE = path.join(STORAGE_DIR, "table-status.json");

type TableStatus = "available" | "not_available" | "occupied";

async function readOverrides(): Promise<Record<number, TableStatus>> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<number, TableStatus>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    console.error("TABLE STATUS READ ERROR:", error);
    return {};
  }
}

async function writeOverrides(overrides: Record<number, TableStatus>) {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.writeFile(STORAGE_FILE, JSON.stringify(overrides, null, 2), "utf8");
}

async function requireAuth() {
  const session = await getAuthTokenFromCookie();
  if (!session?.token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const overrides = await readOverrides();
  return NextResponse.json(overrides);
}

export async function PATCH(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const payload = await request.json().catch(() => null);
  const tableId = Number(payload?.tableId);
  const status = payload?.status as TableStatus | undefined;
  const allowed: TableStatus[] = ["available", "not_available", "occupied"];

  if (!Number.isFinite(tableId) || !status || !allowed.includes(status)) {
    return NextResponse.json(
      { message: "Invalid payload" },
      { status: 400 }
    );
  }

  const overrides = await readOverrides();
  overrides[tableId] = status;
  await writeOverrides(overrides);

  return NextResponse.json({ ok: true, overrides });
}
