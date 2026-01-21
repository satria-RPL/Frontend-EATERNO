// src/app/waiters/layout.tsx
import type { CSSProperties, ReactNode } from "react";
import Navbar from "@/components/Navbar";
import SidebarLeft from "@/components/SidebarLeft";
import { getSessionUser } from "@/lib/session/authSession";
import WaiterMobileActions from "@/components/WaiterMobileActions";

export default async function WaitersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessionUser = await getSessionUser();

  return (
    <div
      className="min-h-screen relative"
      style={{ "--sidebar-width": "12rem" } as CSSProperties}
    >
      <Navbar
        userName={sessionUser.name}
        role={sessionUser.role}
        showSearch={false}
      />

      {/* Sidebar selalu aktif untuk waiters */}
      <div className="hidden md:block">
        <SidebarLeft role={sessionUser.role} />
      </div>

      <main
        className="pt-24 px-4 transition-all duration-300 sm:pt-28 sm:px-6 md:pr-12 md:pl-0 md:ml-[calc(var(--sidebar-width)+1rem)]"
      >
        <div className="w-full">{children}</div>
      </main>

      <WaiterMobileActions />
    </div>
  );
}
