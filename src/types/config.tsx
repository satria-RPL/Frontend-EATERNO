import { usePathname } from "next/navigation";
import { SettingsIcon } from "lucide-react";

import { TagIcon } from "@/components/icons/TagIcon";
import { HomeIcon } from "@/components/icons/HomeIcon";
import type { NavItem } from "@/types/nav";

export const NavItems = (): NavItem[] => {
  const pathname = usePathname();

  const isNavItemActive = (path: string, nav: string) => path.includes(nav);

  return [
    {
      name: "Dashboard",
      href: "/main/dashboard",
      icon: <HomeIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/dashboard"),
      position: "top",
    },
    {
      name: "Products",
      href: "/main/products",
      icon: <TagIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/products"),
      position: "top",
    },
    {
      name: "Product History",
      href: "/main/orderhistory",
      icon: <TagIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/orderhistory"),
      position: "top",
    },
    {
      name: "Settings",
      href: "/main/settings",
      icon: <SettingsIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/settings"),
      position: "bottom",
    },
  ];
};
