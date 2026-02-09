import { memo } from "react";

// mendefinisikan tipe properti untuk komponen StatItem
interface Props {
  label: string;
  value: string | number;
  color?: string;
}

// komponen StatItem untuk menampilkan item statistik dengan label dan nilai
function StatItemComponent({ label, value, color }: Props) {
  return (
    <div className="flex justify-between bg-[#EB5714] p-2 rounded-md">
      <span>{label}</span>
      <span className={`font-semibold ${color ?? "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

export default memo(StatItemComponent);
