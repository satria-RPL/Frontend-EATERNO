import { usePathname } from "next/navigation";

// import { Bell , Home, Settings } from "lucide-react";

import { TagIcon } from "@/components/icons/TagIcon";

import { HomeIcon } from "@/components/icons/HomeIcon";

export const NavItems = () => {
  const pathname = usePathname();

  function isNavItemActive(pathname: string, nav: string) {
    return pathname.includes(nav);
  }

  return [
    {
      name: "Home",
      href: "/",
      icon: <HomeIcon size={20} />,
      active: pathname === "/",
      position: "top",
    },
    {
      name: "Products",
      href: "/Products",
      icon: <TagIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/Products"),
      position: "top",
    },
    {
      name: "Product History",
      href: "/Products/History-Order",
      icon: <TagIcon width={20} height={20} />,
      active: isNavItemActive(pathname, "/Products/History-Order"),
      position: "top",
    },
    //     {
    //   name: "Settings",
    //   href: "/settings",
    //   icon: <TagIcon width={20} height={20} />,
    //   active: isNavItemActive(pathname, "/settings"),
    //   position: "bottom",
    // },
  ];
};
