import type { ReactNode } from "react";
import { cookies } from "next/headers";

import Navbar from "@/components/Navbar";
import SideNav from "@/components/SidebarLeft";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const rawSession = (await cookieStore).get("auth_token")?.value ?? null;

  let userName = "Guest";
  let role = "Kasir";

  if (rawSession) {
    try {
      const parsed = JSON.parse(rawSession) as { name?: string; role?: string };
      if (parsed.name) {
        userName = parsed.name;
      }
      if (parsed.role) {
        role = parsed.role;
      }
    } catch {
      userName = rawSession;
    }
  }
  return (
    <>
      <div className="min-h-screen">
        <Navbar userName={userName} role={role} />
        <SideNav />
        <main className="flex pt-32 pl-58 pr-20">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </>
  );
}
