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
// import { ThemeToggle } from "./theme-toggle";

/* ---------------------------------------------------------------------
   SIDEBAR COMPONENT (MAIN WRAPPER)
------------------------------------------------------------------------ */
function Sidebar() {
  const navItems = NavItems();

  /* ---------------------------------------
     Sidebar expand state + localStorage
  ---------------------------------------- */
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("sidebarExpanded");
      return saved === null ? true : JSON.parse(saved);
    }
    return true;
  });

  // Save state to localStorage when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "sidebarExpanded",
        JSON.stringify(isSidebarExpanded)
      );
    }
  }, [isSidebarExpanded]);

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  return (
    <div className="pr-4">
      {/* SIDEBAR CONTAINER */}
      <div
        className={cn(
          isSidebarExpanded ? "w-[200px]" : "w-[68px]",
          "border-r transition-all duration-300 ease-in-out transform hidden sm:flex h-full bg-accent border-gray-200"
        )}
      >
        {/* ---------------------------------------
            SIDEBAR CONTENT
        ---------------------------------------- */}
        <aside className="flex h-screen flex-col w-full px-4 overflow-x-hidden overflow-y-auto bg-white">
          {/* ---------------------------------------
              TOP NAVIGATION LIST
          ---------------------------------------- */}
          <div className="mt-4 relative pb-2">
            <div className="flex flex-col space-y-1">
              {navItems.map((item, idx) =>
                item.position === "top" ? (
                  <Fragment key={idx}>
                    <div className="space-y-1 bg-white active:bg-pink-50 rounded-[10] p-1">
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
          </div>

          {/* ---------------------------------------
              BOTTOM NAVIGATION LIST
          ---------------------------------------- */}
          <div className="sticky bottom-0 mt-auto mb-4 whitespace-nowrap transition duration-200">
            {/* <ThemeToggle isDropDown={true} /> */}

            {navItems.map((item, idx) =>
              item.position === "bottom" ? (
                <Fragment key={idx}>
                  <div className="space-y-1">
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
        </aside>

        {/* ---------------------------------------
            SIDEBAR TOGGLE BUTTON
        ---------------------------------------- */}
        <div className="mt-[calc(calc(1h)-40px)] relative">
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute top-3 -right-3 flex h-6 w-6 items-center justify-center 
                    border border-muted-foreground/20 rounded-full bg-accent shadow-md 
                    hover:shadow-lg transition-shadow duration-300 ease-in-out text-gray-300"
          >
            {isSidebarExpanded ? (
              <ChevronLeft size={18} className="stroke-foreground" />
            ) : (
              <ChevronRight size={18} className="stroke-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   SIDEBAR ITEM COMPONENT (ICON + LABEL)
------------------------------------------------------------------------ */
export const SideNavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  path: string;
  active: boolean;
  isSidebarExpanded: boolean;
}> = ({ label, icon, path, active, isSidebarExpanded }) => {
  /* Styles */
  const baseClasses =
    "h-full relative flex items-center whitespace-nowrap rounded-md font-base text-sm duration-100";

  const activeClasses =
    "bg-pink-50 text-pink-600 ";

  const inactiveClasses =
    "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-pink-50 dark:hover:text-pink-600";

  return (
    <>
      {/* ---------------------------------------
          EXPANDED SIDEBAR MODE
      ---------------------------------------- */}
      {isSidebarExpanded ? (
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
        /* ---------------------------------------
            COLLAPSED MODE + TOOLTIP
        ---------------------------------------- */
        <TooltipProvider delayDuration={70}>
          <Tooltip>
            <TooltipTrigger>
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
              side="left"
              sideOffset={10}
              className="px-3 py-1.5 text-xs"
            >
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};

export default Sidebar;
