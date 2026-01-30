"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, Tag, Settings, LogOut, CircleHelp } from "lucide-react";
import type { NavItem } from "@/types/nav";

export const useNavItems = (): NavItem[] => {
  const pathname = usePathname();

  const isNavItemActive = (path: string, nav: string) => path.includes(nav);

  const isWaiter =
    pathname.startsWith("/waiters") || pathname.startsWith("/main/waiters");

  if (isWaiter) {
    return [
      {
        name: "Table Info",
        href: "/waiters/tableinfo",
        icon: (
          <Image
            src="/icon/tableinfo.webp"
            alt="Table Info"
            width={20}
            height={20}
          />
        ),
        // ⬅️ PENTING: AUTO SELECT
        active: true,
        position: "top",
      },
      {
        name: "Help Center",
        href: "/main/help",
        icon: <CircleHelp width={20} height={20} />,
        active: isNavItemActive(pathname, "/main/help"),
        position: "bottom",
      },
      {
        name: "Logout",
        href: "/public/shift/closingshift",
        icon: <LogOut width={20} height={20} />,
        active: false,
        position: "bottom",
      },
    ];
  }

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
      icon: <Settings width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/settings"),
      position: "bottom",
    },
    {
      name: "Help Center",
      href: "/main/help",
      icon: <CircleHelp width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/help"),
      position: "bottom",
    },
    {
      name: "Logout",
      href: "/public/shift/closingshift",
      icon: <LogOut width={20} height={20} />,
      active: false,
      position: "bottom",
    },
  ];
};
