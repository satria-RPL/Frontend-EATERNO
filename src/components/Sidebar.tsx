"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavItems } from "@/types/config";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Sidebar() {
  const navItems = NavItems();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("sidebarExpanded");
    if (saved !== null) {
      setIsSidebarExpanded(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "sidebarExpanded",
      JSON.stringify(isSidebarExpanded)
    );
  }, [isSidebarExpanded]);

  const toggleSidebar = () => setIsSidebarExpanded((prev) => !prev);

  return (
    <aside
      className={cn(
        "fixed top-20 bottom-0 left-0 border-r-2 border-gray-200 bg-white flex flex-col justify-between px-4 py-4 z-20 transform ease-in-out duration-300",
        isSidebarExpanded ? "w-48" : "w-[68px]"
      )}
    >
      {/* TOGGLE BUTTON */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute top-16 -right-3 flex h-6 w-6 items-center justify-center border-gray-200 border-2 rounded-full bg-accent shadow-md hover:shadow-lg transition-shadow duration- 300 ease-in-out"
      >
        {isSidebarExpanded ? (
          <ChevronLeft size={18} className="stroke-gray-500" />
        ) : (
          <ChevronRight size={18} className="stroke-gray-500" />
        )}
      </button>

      {/* TOP MENU */}
      <div className="space-y-1 mt-4">
        {navItems.map((item, idx) =>
          item.position === "top" ? (
            <Fragment key={idx}>
              <div className="space-y-1 rounded-[10px] p-1">
                <SideNavItem
                  label={item.name}
                  icon={item.icon}
                  path={item.href}
                  active={item.active}
                  isSidebarExpanded={isSidebarExpanded}
                />
              </div>
            </Fragment>
          ) : null
        )}
      </div>

      {/* BOTTOM MENU */}
      <div className="space-y-1 mb-4">
        {navItems.map((item, idx) =>
          item.position === "bottom" ? (
            <Fragment key={idx}>
              <SideNavItem
                label={item.name}
                icon={item.icon}
                path={item.href}
                active={item.active}
                isSidebarExpanded={isSidebarExpanded}
              />
            </Fragment>
          ) : null
        )}
      </div>
    </aside>
  );
}

/* --------------------------------------------------------------------- */

export const SideNavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  path: string;
  active: boolean;
  isSidebarExpanded: boolean;
}> = ({ label, icon, path, active, isSidebarExpanded }) => {
  const baseClasses =
    "h-full relative flex items-center whitespace-nowrap rounded-md font-base text-sm duration-100";
  const activeClasses = "bg-pink-50 text-pink-600";
  const inactiveClasses =
    "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-pink-50 dark:hover:text-pink-600";

  return isSidebarExpanded ? (
    <Link
      href={path}
      className={cn(baseClasses, active ? activeClasses : inactiveClasses)}
    >
      <div className="py-1.5 px-2 flex flex-row items-center space-x-2 rounded-md">
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  ) : (
    <TooltipProvider delayDuration={70}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={path}
            className={cn(
              baseClasses,
              active ? activeClasses : inactiveClasses
            )}
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
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Sidebar;
