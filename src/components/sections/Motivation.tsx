"use client";

import Card from "../cards/Card";
import { useEffect, useState } from "react";
import { MOTIVATION_QUOTES } from "@/data/motivationQuotes";

export default function Motivation({ userName }: { userName?: string }) {
  const quotes = MOTIVATION_QUOTES;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * quotes.length);
        } while (next === prev); // cegah quote sama muncul lagi

        return next;
      });
    }, 10000); // ganti setiap 10 detik

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <Card>
      <h2 className="text-2xl font-medium font-[Poppins]">🔥 Motivasi Shift Hari Ini</h2>

      <div className="flex mt-5 h-full">
        <p className="text-xl text-gray-700 font-[Poppins] transition-opacity duration-500">
          <span className="font-semibold">{userName ? `${userName}, ` : ""}</span>
          <span className="italic">“{quotes[index]}”</span>
        </p>
      </div>
    </Card>
  );
}
