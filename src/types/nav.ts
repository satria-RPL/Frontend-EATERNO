import type { ReactNode } from "react";

export type NavPosition = "top" | "bottom";

export type NavItem = {
  name: string;
  href: string;
  icon: ReactNode;
  active: boolean;
  position: NavPosition;
};
