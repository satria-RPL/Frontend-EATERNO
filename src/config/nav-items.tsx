"use client";

import { usePathname } from "next/navigation";
import { Home, Tag, Settings, LogOut, CircleHelp } from "lucide-react";
import type { NavItem } from "@/types/nav";

export const useNavItems = (): NavItem[] => {
  const pathname = usePathname();

  const isNavItemActive = (path: string, nav: string) => path.includes(nav);

  return [
    {
      name: "Dashboard",
      href: "/main/dashboard",
      icon: <Home width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/dashboard"),
      position: "top",
    },
    {
      name: "Products",
      href: "/main/products",
      icon: <Tag width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/products"),
      position: "top",
    },
    {
      name: "Product History",
      href: "/main/orderhistory",
      icon: <Tag width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/orderhistory"),
      position: "top",
    },
    {
      name: "Settings",
      href: "/main/settings",
      icon: <Settings className="stroke-current" width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/settings"),
      position: "bottom",
    },
    {
      name: "Help Center",
      href: "/main/help",
      icon: <CircleHelp className="stroke-current" width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/help"),
      position: "bottom",
    },
    {
      name: "Logout",
      href: "/public/shift/closingshift",
      icon: <LogOut className="stroke-current" width={20} height={20} />,
      active: false,
      position: "bottom",
    },
  ];
};