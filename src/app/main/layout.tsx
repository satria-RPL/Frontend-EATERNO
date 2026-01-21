import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SideNav from "@/components/SidebarLeft";
import { getSessionUser } from "@/lib/session/authSession";
import { apiRequest } from "@/lib/api";
import { hasActiveCashierShift } from "@/domain/shift/cashierShiftStatus";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessionUser = await getSessionUser();

  const normalizedRole = sessionUser.role.toLowerCase();
  const isKitchenRole =
    normalizedRole.includes("chef") || normalizedRole.includes("kitchen");
  const isCashier = normalizedRole.includes("cashier");

  if (isCashier) {
    const shiftsResult = await apiRequest("/api/cashier-shifts", { auth: true });
    const hasOpenShift =
      shiftsResult.ok &&
      hasActiveCashierShift(shiftsResult.data, sessionUser.id);

    if (!hasOpenShift) {
      redirect("/public/shift/openshift");
    }
  }

  return (
    <div className="min-h-screen relative">
      <Navbar
        userName={sessionUser.name}
        role={sessionUser.role}
        showLogout={isKitchenRole}
      />

      {/* Sidebar */}
      {!isKitchenRole && <SideNav role={sessionUser.role} />}

      {/* Main Content */}
      <main
        className={`pt-32 ${isKitchenRole ? "px-8" : "pr-20"} transition-all duration-300`}
        style={
          isKitchenRole
            ? undefined
            : { marginLeft: "calc(var(--sidebar-width) + 1rem)" }
        }
      >
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
