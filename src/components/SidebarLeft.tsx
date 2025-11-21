"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavItems } from "@/config/nav-items";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/nav";
import { usePersistentBoolean } from "@/lib/hooks/usePersistentBoolean";

export default function SidebarLeft() {
  const navItems = NavItems();
  const { value: isSidebarExpanded, toggle } = usePersistentBoolean(
    "sidebarExpanded",
    true
  );

  const topItems = navItems.filter((item) => item.position === "top");
  const bottomItems = navItems.filter((item) => item.position === "bottom");

  return (
    <aside
      className={cn(
        "fixed top-20 bottom-0 left-0 border-r-2 border-gray-200 bg-white px-3 py-3 z-20 transform ease-in-out duration-300",
        isSidebarExpanded ? "w-48" : "w-20"
      )}
    >
      {/* toggle button */}
      <button
        type="button"
        onClick={toggle}
        className="absolute top-16 -right-3 flex h-6 w-6 items-center justify-center border-gray-200 border-2 rounded-full bg-accent shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
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
        <div className="mt-3 space-y-1">
          {topItems.map((item) => (
            <SideNavItem
              key={item.href}
              {...item}
              isSidebarExpanded={isSidebarExpanded}
            />
          ))}
        </div>

        {/* BOTTOM */}
        <div className="mb-3 space-y-1">
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
    "relative flex items-center whitespace-nowrap rounded-md text-sm duration-100";
  const activeClasses = "bg-pink-50 text-pink-600";
  const inactiveClasses =
    "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-pink-50 dark:hover:text-pink-600";

  return isSidebarExpanded ? (
    <Link
      href={href}
      className={cn(baseClasses, active ? activeClasses : inactiveClasses)}
    >
      <div className="py-2 px-4 gap-2 flex flex-row items-center rounded-md transform">
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
            <div className="py-2 px-4 flex items-center justify-center rounded-md transform">
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
