"use client";

import { Fragment } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavItems } from "@/config/nav-items";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        "fixed top-20 bottom-0 left-0 border-r-2 border-gray-200 bg-white flex flex-col justify-between px-4 py-4 z-20 transform ease-in-out duration-300",
        isSidebarExpanded ? "w-48" : "w-20"
      )}
    >
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

      <div className="space-y-1 mt-4">
        {topItems.map((item) => (
          <Fragment key={item.href}>
            <div className="space-y-1 rounded-[10px] p-1">
              <SideNavItem {...item} isSidebarExpanded={isSidebarExpanded} />
            </div>
          </Fragment>
        ))}
      </div>

      <div className="space-y-1 mb-4">
        {bottomItems.map((item) => (
          <Fragment key={item.href}>
            <SideNavItem {...item} isSidebarExpanded={isSidebarExpanded} />
          </Fragment>
        ))}
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
    "h-full relative flex items-center whitespace-nowrap rounded-md font-base text-sm duration-100";
  const activeClasses = "bg-pink-50 text-pink-600";
  const inactiveClasses =
    "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-pink-50 dark:hover:text-pink-600";

  return isSidebarExpanded ? (
    <Link
      href={href}
      className={cn(baseClasses, active ? activeClasses : inactiveClasses)}
    >
      <div className="py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md">
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
            className={cn(baseClasses, active ? activeClasses : inactiveClasses)}
          >
            <div className="p-2 flex items-center justify-center rounded-md">
              {icon}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={10}
          className="px-3 py-1.5 text-xs"
        >
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
