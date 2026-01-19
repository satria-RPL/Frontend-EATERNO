"use client";

import { useEffect, useState } from "react";

export function usePersistentBoolean(key: string, initial: boolean) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(key);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "boolean") {
          setValue(parsed);
        }
      } catch {
        // Ignore invalid storage values and keep the current state.
      }
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  const toggle = () => setValue((prev) => !prev);

  return { value, setValue, toggle };
}
