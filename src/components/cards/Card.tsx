import { ReactNode } from "react";

// komponen Card untuk membungkus konten dengan gaya kartu
export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#F8F8FA] rounded-xl shadow p-5">
      {children}
    </div>
  );
}
