"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChefHat } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavItems } from "@/config/nav-items";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/nav";
import { usePersistentBoolean } from "@/lib/hooks/usePersistentBoolean";
import { useEffect, useMemo } from "react";

type SidebarLeftProps = {
  role?: string;
};

export default function SidebarLeft({ role }: SidebarLeftProps) {
  const navItems = useNavItems();
  const pathname = usePathname();
  const { value: isSidebarExpanded, toggle } = usePersistentBoolean(
    "sidebarExpanded",
    true
  );

  // ⬇️ Update CSS variable otomatis setiap toggle
  useEffect(() => {
    const width = isSidebarExpanded ? "12rem" : "5rem";
    document.documentElement.style.setProperty("--sidebar-width", width);
  }, [isSidebarExpanded]);

  const normalizedRole = (role ?? "").toLowerCase();
  const isChef = normalizedRole.includes("chef");
  const kitchenNavItem = useMemo<NavItem>(
    () => ({
      name: "Kitchen",
      href: "/main/kitchen",
      icon: <ChefHat width={20} height={20} />,
      active: pathname.startsWith("/main/kitchen"),
      position: "top",
    }),
    [pathname]
  );

  const filteredItems = useMemo(() => {
    if (!isChef) return navItems;
    const allowedBottom = navItems.filter(
      (item) =>
        item.href.startsWith("/main/help") ||
        item.href.startsWith("/main/settings") ||
        item.href.startsWith("/public/shift/closingshift")
    );
    return [kitchenNavItem, ...allowedBottom];
  }, [isChef, navItems, kitchenNavItem]);

  const topItems = filteredItems.filter((item) => item.position === "top");
  const bottomItems = filteredItems.filter((item) => item.position === "bottom");

  return (
    <aside
      className={cn(
        "fixed top-22 bottom-0 left-0 border-r-2 bg-(--background) border-gray-200 px-3 py-3 z-20 transform ease-in-out duration-300",
        isSidebarExpanded ? "w-48" : "w-20"
      )}
    >
      {/* toggle button */}
      <button
        type="button"
        onClick={toggle}
        className="absolute top-16 -right-3 flex h-6 w-6 items-center justify-center border-gray-200 border-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
      >
        {isSidebarExpanded ? (
          <ChevronLeft size={18} className="stroke-gray-500" />
        ) : (
          <ChevronRight size={18} className="stroke-gray-500" />
        )}
      </button>

      {/* ini yang di-justify-between */}
      <div className="flex h-full flex-col justify-between">
        {/* TOP */}
        <div className="mt-3 space-y-4">
          {topItems.map((item) => (
            <SideNavItem
              key={item.href}
              {...item}
              isSidebarExpanded={isSidebarExpanded}
            />
          ))}
        </div>

        {/* BOTTOM */}
        <div className="mb-3 space-y-4">
          {bottomItems.map((item) => (
            <SideNavItem
              key={item.href}
              {...item}
              isSidebarExpanded={isSidebarExpanded}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

type SideNavItemProps = NavItem & { isSidebarExpanded: boolean };

export function SideNavItem({
  name,
  icon,
  href,
  active,
  isSidebarExpanded,
}: SideNavItemProps) {
  const baseClasses =
    "relative flex items-center whitespace-nowrap rounded-md text-sm duration-100 bg-white";
  const activeClasses = "bg-orange-50 text-orange-500";
  const inactiveClasses = "hover:bg-orange-50 hover:text-orange-500";

  return isSidebarExpanded ? (
    <Link
      href={href}
      className={cn(baseClasses, active ? activeClasses : inactiveClasses)}
    >
      <div className="py-2 px-4 gap-2 flex flex-row items-center rounded-md">
        {icon}
        <span>{name}</span>
      </div>
    </Link>
  ) : (
    <TooltipProvider delayDuration={70}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              baseClasses,
              active ? activeClasses : inactiveClasses
            )}
          >
            <div className="py-2 px-4 flex items-center justify-center rounded-md">
              {icon}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={20}
          className="px-2 py-2 text-xs bg-neutral-900 text-neutral-100 rounded-md shadow"
        >
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
