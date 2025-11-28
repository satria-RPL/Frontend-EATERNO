import type { ReactNode } from "react";
import { cookies } from "next/headers";

import Navbar from "@/components/Navbar";
import SideNav from "@/components/SidebarLeft";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get("auth_token")?.value ?? null;

  let userName = "";
  let role = "";

  if (rawSession) {
    try {
      const parsed = JSON.parse(rawSession) as { name?: string; role?: string };
      if (parsed.name) userName = parsed.name;
      if (parsed.role) role = parsed.role;
    } catch {
      userName = rawSession;
    }
  }

  return (
    <div className="min-h-screen relative">
      <Navbar userName={userName} role={role} />

      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <main
        className="pt-32 pr-20 transition-all duration-300"
        style={{ marginLeft: "calc(var(--sidebar-width) + 1rem)" }}
      >
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
