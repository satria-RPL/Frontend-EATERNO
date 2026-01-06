"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function HistoryOrderSearchBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOrderHistory = pathname?.includes("/main/orderhistory");

  const queryValue = useMemo(
    () => searchParams.get("search") ?? "",
    [searchParams]
  );
  const [value, setValue] = useState(queryValue);

  useEffect(() => {
    setValue(queryValue);
  }, [queryValue]);

  if (!isOrderHistory) return null;

  const handleChange = (next: string) => {
    setValue(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim().length === 0) {
      params.delete("search");
    } else {
      params.set("search", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="relative w-full max-w-[520px]">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-(--background-dark)"
      />
      <input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search Menu, Order and More"
        className="w-full rounded-xl border border-(--tertiary) bg-(--default) py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-(--primary)"
      />
    </div>
  );
}
