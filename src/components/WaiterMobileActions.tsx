"use client";

import { useState } from "react";
import Link from "next/link";
import { Headset, LogOut } from "lucide-react";

export default function WaiterMobileActions() {
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3 md:hidden">
      <Link
        href="/main/help"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition hover:bg-orange-600"
        aria-label="Help Center"
      >
        <Headset size={20} />
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}
