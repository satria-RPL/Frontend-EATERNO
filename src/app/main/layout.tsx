import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import SideNav from "@/components/SidebarLeft";
import { getSessionUser } from "@/lib/session/authSession";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessionUser = await getSessionUser();

  return (
    <div className="min-h-screen relative">
      <Navbar userName={sessionUser.name} role={sessionUser.role} />

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
