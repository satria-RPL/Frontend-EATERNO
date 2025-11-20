import { usePathname } from "next/navigation";

import { Bell , Home, Settings, SettingsIcon } from "lucide-react";

import { TagIcon } from "@/components/icons/TagIcon";

import { HomeIcon } from "@/components/icons/HomeIcon";

export const NavItems = () => {
  const pathname = usePathname();

  function isNavItemActive(pathname: string, nav: string) {
    return pathname.includes(nav);
  }

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
      href: "/main/Products",
      icon: <TagIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/Products"),
      position: "top",
    },
    {
      name: "Product History",
      href: "/main/Products/History-Order",
      icon: <TagIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/Products/History-Order"),
      position: "top",
    },
    {
      name: "Settings",
      href: "/main/Settings",
      icon: <SettingsIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/main/settings"),
      position: "bottom",
    },
  ];
};
